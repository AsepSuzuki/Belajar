import { beforeEach, describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { sessions, users } from "../src/db/schema";
import { app } from "../src/index";

describe("Users CRUD API", () => {
  beforeEach(async () => {
    // Bersihkan data sebelum setiap skenario test agar konsisten
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("GET /api/users (Get All Users)", () => {
    it("harus mengembalikan array kosong jika belum ada user di database", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "GET",
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any[];
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(0);
    });

    it("harus mengembalikan daftar user jika data tersedia tanpa mengekspos password", async () => {
      // Masukkan 2 data user
      await db.insert(users).values([
        {
          name: "User One",
          email: "one@example.com",
          password: "hashedpassword1",
        },
        {
          name: "User Two",
          email: "two@example.com",
          password: "hashedpassword2",
        },
      ]);

      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "GET",
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any[];
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(2);

      // Verifikasi struktur kolom
      for (const item of json) {
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.email).toBeDefined();
        expect(item.createdAt).toBeDefined();
        expect(item.password).toBeUndefined();
      }
    });
  });

  describe("GET /api/users/:id (Get User By ID)", () => {
    it("harus mengembalikan detail data user untuk ID yang terdaftar", async () => {
      const [inserted] = await db
        .insert(users)
        .values({
          name: "Detail User",
          email: "detail@example.com",
          password: "hashedpassword",
        })
        .$returningId();

      const response = await app.handle(
        new Request(`http://localhost/api/users/${inserted!.id}`, {
          method: "GET",
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.id).toBe(inserted!.id);
      expect(json.name).toBe("Detail User");
      expect(json.email).toBe("detail@example.com");
      expect(json.createdAt).toBeDefined();
      expect(json.password).toBeUndefined();
    });

    it("harus gagal (404 Not Found) jika ID tidak ada di database", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/99999", {
          method: "GET",
        })
      );

      expect(response.status).toBe(404);
      const json = (await response.json()) as any;
      expect(json).toEqual({ message: "User not found" });
    });

    it("harus gagal (400 Bad Request) jika ID yang diberikan bukan angka", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/invalid-id", {
          method: "GET",
        })
      );

      expect(response.status).toBe(400);
      const json = (await response.json()) as any;
      expect(json).toEqual({ message: "Invalid ID" });
    });
  });

  describe("PUT /api/users/:id (Update User)", () => {
    it("harus berhasil mengubah name saja pada user yang valid", async () => {
      const [inserted] = await db
        .insert(users)
        .values({
          name: "Original Name",
          email: "original@example.com",
          password: "hashedpassword",
        })
        .$returningId();

      const response = await app.handle(
        new Request(`http://localhost/api/users/${inserted!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Updated Name",
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json).toEqual({ message: "User updated successfully" });

      // Verifikasi di database
      const [updated] = await db
        .select()
        .from(users)
        .where(eq(users.id, inserted!.id));
      expect(updated!.name).toBe("Updated Name");
      expect(updated!.email).toBe("original@example.com");
    });

    it("harus berhasil mengubah email saja pada user yang valid", async () => {
      const [inserted] = await db
        .insert(users)
        .values({
          name: "Keep Name",
          email: "old@example.com",
          password: "hashedpassword",
        })
        .$returningId();

      const response = await app.handle(
        new Request(`http://localhost/api/users/${inserted!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "new@example.com",
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json).toEqual({ message: "User updated successfully" });

      // Verifikasi di database
      const [updated] = await db
        .select()
        .from(users)
        .where(eq(users.id, inserted!.id));
      expect(updated!.name).toBe("Keep Name");
      expect(updated!.email).toBe("new@example.com");
    });

    it("harus gagal (404 Not Found) jika ID tidak ditemukan", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/99999", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "New Name",
          }),
        })
      );

      expect(response.status).toBe(404);
      const json = (await response.json()) as any;
      expect(json).toEqual({ message: "User not found" });
    });

    it("harus gagal (422) jika format email baru tidak valid", async () => {
      const [inserted] = await db
        .insert(users)
        .values({
          name: "Test User",
          email: "valid@example.com",
          password: "hashedpassword",
        })
        .$returningId();

      const response = await app.handle(
        new Request(`http://localhost/api/users/${inserted!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "not-an-email",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("DELETE /api/users/:id (Delete User)", () => {
    it("harus berhasil menghapus user yang valid dari database", async () => {
      const [inserted] = await db
        .insert(users)
        .values({
          name: "User To Delete",
          email: "delete@example.com",
          password: "hashedpassword",
        })
        .$returningId();

      const response = await app.handle(
        new Request(`http://localhost/api/users/${inserted!.id}`, {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json).toEqual({ message: "User deleted successfully" });

      // Verifikasi di database bahwa user sudah terhapus
      const [deleted] = await db
        .select()
        .from(users)
        .where(eq(users.id, inserted!.id));
      expect(deleted).toBeUndefined();
    });

    it("harus gagal (404 Not Found) jika ID tidak ditemukan", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/99999", {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(404);
      const json = (await response.json()) as any;
      expect(json).toEqual({ message: "User not found" });
    });

    it("harus gagal (400 Bad Request) jika ID bukan angka valid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/abc", {
          method: "DELETE",
        })
      );

      expect(response.status).toBe(400);
      const json = (await response.json()) as any;
      expect(json).toEqual({ message: "Invalid ID" });
    });
  });
});
