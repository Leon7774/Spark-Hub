// lib/indexedDb.ts
import { openDB } from "idb";

// Initialize the database and object stores
export async function initDB() {
  const db = await openDB("sparkhub-db", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("customers")) {
        db.createObjectStore("customers", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("plans")) {
        db.createObjectStore("plans", { keyPath: "id" });
      }
    },
  });
  return db;
}
