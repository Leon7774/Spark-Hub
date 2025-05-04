// lib/indexedDb.ts
import { openDB } from "idb";

// Function to initialize the database and object stores
export async function initDB() {
  const db = await openDB("sparkhub-db", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("customers")) {
        db.createObjectStore("customers", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("subscription_plans")) {
        db.createObjectStore("subscription_plans", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("active_subscriptions")) {
        db.createObjectStore("active_subscriptions", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("log")) {
        db.createObjectStore("log", { keyPath: "id" });
      }
    },
  });
  return db;
}
