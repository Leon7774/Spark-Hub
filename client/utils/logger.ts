import { createClient } from "@/utils/supabase/client";
import { createClient as createServerClient } from "@/utils/supabase/server";

export type ActionType =
  | "login"
  | "logout"
  | "register"
  | "create_session"
  | "update_session"
  | "delete_session"
  | "create_customer"
  | "update_customer"
  | "delete_customer"
  | "create_plan"
  | "update_plan"
  | "delete_plan";

export interface LogEntry {
  action_type: ActionType;
  description: string;
  metadata?: Record<string, any>;
}

// Client-side logging
export async function logAction(entry: LogEntry) {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user found when trying to log action");
      return;
    }

    // Insert log entry
    const { error } = await supabase.from("action_logs").insert({
      user_id: user.id,
      action_type: entry.action_type,
      description: entry.description,
      metadata: entry.metadata || {},
    });

    if (error) {
      console.error("Error logging action:", error);
    }
  } catch (error) {
    console.error("Error in logAction:", error);
  }
}

// Server-side logging
export async function logServerAction(entry: LogEntry, userId: string) {
  try {
    const supabase = await createServerClient();

    // Insert log entry
    const { error } = await supabase.from("action_logs").insert({
      user_id: userId,
      action_type: entry.action_type,
      description: entry.description,
      metadata: entry.metadata || {},
    });

    if (error) {
      console.error("Error logging server action:", error);
    }
  } catch (error) {
    console.error("Error in logServerAction:", error);
  }
}
