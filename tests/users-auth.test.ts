import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { db, pool } from "../src/db";
import { sessions, users } from "../src/db/schema";
import { app } from "../src/index";

describe("Users Auth API", () => {
  beforeEach(async () => {
    // Bersihkan database sebelum setiap skenario test
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("POST /api/users (Registrasi)", () => {
    it("harus berhasil registrasi dengan data valid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "johndoe@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json).toEqual({ data: "OK" });
    });

    it("harus gagal jika format email tidak valid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "invalid-email-format",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("harus gagal jika field name, email, atau password kosong", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "",
            email: "",
            password: "",
          }),
        })
      );

      expect(response.status).toBe(422);
    });

    it("harus gagal jika email sudah terdaftar", async () => {
      // Registrasi pertama
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "First User",
            email: "duplicate@example.com",
            password: "password123",
          }),
        })
      );

      // Registrasi kedua dengan email yang sama
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Second User",
            email: "duplicate@example.com",
            password: "secretpassword",
          }),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json).toEqual({ eror: "Email sudah terdaftar" });
    });

    it("harus gagal jika panjang input melebihi 255 karakter", async () => {
      const longString = "a".repeat(256);
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: longString,
            email: "valid@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/users/login (Login)", () => {
    beforeEach(async () => {
      // Siapkan user untuk login
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Login User",
            email: "user@example.com",
            password: "password123",
          }),
        })
      );
    });

    it("harus berhasil login dengan email dan password yang benar", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "user@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(typeof json.data).toBe("string");
      expect(json.data.length).toBeGreaterThan(0);
    });

    it("harus gagal login jika email tidak ditemukan", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "notfound@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json).toEqual({ eror: "Email atau password salah" });
    });

    it("harus gagal login jika password salah", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "user@example.com",
            password: "wrongpassword",
          }),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json).toEqual({ eror: "Email atau password salah" });
    });

    it("harus gagal login dengan format email tidak valid atau terlalu panjang", async () => {
      const invalidEmailResponse = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "invalid-email",
            password: "password123",
          }),
        })
      );
      expect(invalidEmailResponse.status).toBe(422);

      const longEmail = `${"a".repeat(250)}@example.com`;
      const longEmailResponse = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: longEmail,
            password: "password123",
          }),
        })
      );
      expect(longEmailResponse.status).toBe(422);
    });
  });

  describe("GET /api/users/login/current (Get Current User)", () => {
    let validToken: string;

    beforeEach(async () => {
      // Registrasi dan login untuk mendapatkan token valid
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Current User",
            email: "current@example.com",
            password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "current@example.com",
            password: "password123",
          }),
        })
      );

      const loginData = (await loginRes.json()) as any;
      validToken = loginData.data;
    });

    it("harus berhasil mendapatkan detail user saat ini dengan token valid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${validToken}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.data).toBeDefined();
      expect(json.data.name).toBe("Current User");
      expect(json.data.email).toBe("current@example.com");
      expect(json.data.id).toBeDefined();
      expect(json.data.created_at).toBeDefined();
      // Pastikan password tidak dikembalikan
      expect(json.data.password).toBeUndefined();
    });

    it("harus gagal jika tidak menyertakan header Authorization", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login/current", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ eror: "Unauthorized" });
    });

    it("harus gagal jika format header Authorization salah (tidak memakai Bearer)", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login/current", {
          method: "GET",
          headers: {
            Authorization: `Basic ${validToken}`,
          },
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ eror: "Unauthorized" });
    });

    it("harus gagal jika token tidak ditemukan di database", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login/current", {
          method: "GET",
          headers: {
            Authorization: "Bearer non-existent-token-uuid",
          },
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json).toEqual({ eror: "Unauthorized" });
    });
  });
});
