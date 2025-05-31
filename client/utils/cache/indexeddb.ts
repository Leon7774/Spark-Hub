// lib/indexedDb.ts
import { openDB } from "idb";
import { createClient } from "@/utils/supabase/client";
import { Customer } from "@/app/api/customers";
import { Plan } from "@/app/api/plans";

// Types for our cached data
export interface CachedData {
  lastSync: Date;
  data: any[];
}

// Types for pending changes
export interface PendingChange {
  id: string;
  table: string;
  action: "insert" | "update" | "delete";
  data: any;
  timestamp: Date;
}

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
      if (!db.objectStoreNames.contains("sync_status")) {
        db.createObjectStore("sync_status", { keyPath: "store" });
      }
      if (!db.objectStoreNames.contains("pending_changes")) {
        db.createObjectStore("pending_changes", { keyPath: "id" });
      }
    },
  });
  return db;
}

// Function to add a pending change
export async function addPendingChange(
  change: Omit<PendingChange, "id" | "timestamp">,
) {
  const db = await initDB();
  const tx = db.transaction("pending_changes", "readwrite");
  const store = tx.objectStore("pending_changes");

  const pendingChange: PendingChange = {
    ...change,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };

  await store.put(pendingChange);
  await tx.done;
  return pendingChange;
}

// Function to get all pending changes
export async function getPendingChanges(): Promise<PendingChange[]> {
  const db = await initDB();
  const tx = db.transaction("pending_changes", "readonly");
  const store = tx.objectStore("pending_changes");
  return store.getAll();
}

// Function to remove a pending change after successful sync
export async function removePendingChange(id: string) {
  const db = await initDB();
  const tx = db.transaction("pending_changes", "readwrite");
  const store = tx.objectStore("pending_changes");
  await store.delete(id);
  await tx.done;
}

// Function to sync pending changes to Supabase
export async function syncPendingChangesToSupabase() {
  const db = await initDB();
  const supabase = await createClient();
  const pendingChanges = await getPendingChanges();

  for (const change of pendingChanges) {
    try {
      switch (change.action) {
        case "insert":
          await supabase.from(change.table).insert(change.data);
          break;
        case "update":
          await supabase
            .from(change.table)
            .update(change.data)
            .eq("id", change.data.id);
          break;
        case "delete":
          await supabase.from(change.table).delete().eq("id", change.data.id);
          break;
      }
      // Remove the pending change after successful sync
      await removePendingChange(change.id);
    } catch (error) {
      console.error(`Failed to sync change ${change.id}:`, error);
      // Log the error but continue with other changes
      await addLogEntry({
        id: crypto.randomUUID(),
        message: `Failed to sync change ${change.id}: ${error}`,
        timestamp: new Date(),
      });
    }
  }
}

// Function to sync data from Supabase to IndexedDB
export async function syncDataFromSupabase() {
  const db = await initDB();
  const supabase = await createClient();

  // Sync customers
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("*");

  if (!customersError && customers) {
    const tx = db.transaction("customers", "readwrite");
    const store = tx.objectStore("customers");
    await store.clear();
    for (const customer of customers) {
      await store.put(customer);
    }
    await tx.done;
    await db.put(
      "sync_status",
      {
        store: "customers",
        lastSync: new Date().toISOString(),
      },
      "customers",
    );
  }

  // Sync subscription plans
  const { data: plans, error: plansError } = await supabase
    .from("subscription_plans")
    .select("*");

  if (!plansError && plans) {
    const tx = db.transaction("subscription_plans", "readwrite");
    const store = tx.objectStore("subscription_plans");
    await store.clear();
    for (const plan of plans) {
      await store.put(plan);
    }
    await tx.done;
    await db.put(
      "sync_status",
      {
        store: "subscription_plans",
        lastSync: new Date().toISOString(),
      },
      "subscription_plans",
    );
  }

  // Sync active subscriptions
  const { data: activeSubs, error: activeSubsError } = await supabase
    .from("active_subscriptions")
    .select("*");

  if (!activeSubsError && activeSubs) {
    const tx = db.transaction("active_subscriptions", "readwrite");
    const store = tx.objectStore("active_subscriptions");
    await store.clear();
    for (const sub of activeSubs) {
      await store.put(sub);
    }
    await tx.done;
    await db.put(
      "sync_status",
      {
        store: "active_subscriptions",
        lastSync: new Date().toISOString(),
      },
      "active_subscriptions",
    );
  }

  // Sync sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("*");

  if (!sessionsError && sessions) {
    const tx = db.transaction("sessions", "readwrite");
    const store = tx.objectStore("sessions");
    await store.clear();
    for (const session of sessions) {
      await store.put(session);
    }
    await tx.done;
    await db.put(
      "sync_status",
      {
        store: "sessions",
        lastSync: new Date().toISOString(),
      },
      "sessions",
    );
  }

  // After syncing from server, try to sync any pending changes back
  await syncPendingChangesToSupabase();
}

// Function to get cached customers
export async function getCachedCustomers(): Promise<Customer[]> {
  const db = await initDB();
  const tx = db.transaction("customers", "readonly");
  const store = tx.objectStore("customers");
  return store.getAll();
}

// Function to get cached plans
export async function getCachedPlans(): Promise<Plan[]> {
  const db = await initDB();
  const tx = db.transaction("subscription_plans", "readonly");
  const store = tx.objectStore("subscription_plans");
  return store.getAll();
}

// Function to get cached plans by type
export async function getCachedPlansByType(type: string): Promise<Plan[]> {
  const db = await initDB();
  const tx = db.transaction("subscription_plans", "readonly");
  const store = tx.objectStore("subscription_plans");
  const allPlans = await store.getAll();
  return allPlans.filter((plan) => plan.plan_type === type && plan.is_active);
}

// Function to check if data needs syncing (e.g., if last sync was more than 5 minutes ago)
export async function shouldSyncData(): Promise<boolean> {
  const db = await initDB();
  const tx = db.transaction("sync_status", "readonly");
  const store = tx.objectStore("sync_status");
  const status = await store.get("customers"); // Using customers as reference

  if (!status) return true;

  const lastSync = new Date(status.lastSync);
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return lastSync < fiveMinutesAgo;
}

// Function to add a activity_log entry
export async function addLogEntry(entry: {
  id: string;
  message: string;
  timestamp: Date;
}) {
  const db = await initDB();
  const tx = db.transaction("log", "readwrite");
  const store = tx.objectStore("log");
  await store.put(entry);
  await tx.done;
}

// Function to get all activity_log entries
export async function getLogEntries() {
  const db = await initDB();
  const tx = db.transaction("log", "readonly");
  const store = tx.objectStore("log");
  return store.getAll();
}

// Function to create a new session
export async function createSession(sessionData: any) {
  const db = await initDB();

  // Add to local cache
  const tx = db.transaction("sessions", "readwrite");
  const store = tx.objectStore("sessions");
  await store.put(sessionData);
  await tx.done;

  // Add pending change for server sync
  await addPendingChange({
    table: "sessions",
    action: "insert",
    data: sessionData,
  });

  // Try to sync immediately
  try {
    await syncPendingChangesToSupabase();
  } catch (error) {
    console.error("Failed to sync session immediately:", error);
    // The change will be synced later
  }
}

// Function to update a session
export async function updateSession(sessionData: any) {
  const db = await initDB();

  // Update local cache
  const tx = db.transaction("sessions", "readwrite");
  const store = tx.objectStore("sessions");
  await store.put(sessionData);
  await tx.done;

  // Add pending change for server sync
  await addPendingChange({
    table: "sessions",
    action: "update",
    data: sessionData,
  });

  // Try to sync immediately
  try {
    await syncPendingChangesToSupabase();
  } catch (error) {
    console.error("Failed to sync session update immediately:", error);
    // The change will be synced later
  }
}

// Function to get cached sessions
export async function getCachedSessions(): Promise<any[]> {
  const db = await initDB();
  const tx = db.transaction("sessions", "readonly");
  const store = tx.objectStore("sessions");
  const sessions = await store.getAll();

  // Get related data
  const customers = await getCachedCustomers();
  const plans = await getCachedPlans();

  // Enrich session data with customer and plan information
  return sessions.map((session) => ({
    ...session,
    customer: customers.find((c) => c.id === session.customer_id),
    plan: plans.find((p) => p.id === session.plan_id),
  }));
}
