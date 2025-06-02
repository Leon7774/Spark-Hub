import { toast } from "sonner";
import { mutate } from "swr";
import {
  differenceInMinutes,
  differenceInDays,
  isBefore,
  isToday,
} from "date-fns";
import { Session } from "@/lib/schemas";
import { createClient } from "@/utils/supabase/client";
import { log } from "console";

export async function getCustomerById(id: number) {
  const res = await fetch(`/api/customers/${id}`);
  if (!res.ok) {
    throw new Error("Customer not found");
  }
  const data = await res.json();
  toast.success("Customer retrieved successfully");
  return data;
}

/**
 * Gets a plan by its unique identifier.
 *
 * This function retrieves a plan by its unique identifier. It communicates with
 * the backend API to retrieve the plan data.
 *
 * @param id - The unique identifier of the plan to be retrieved.
 * @returns The plan object if the request is successful.
 * @throws error throw an error if the plan is not found or if the request fails.
 */
export async function getPlanById(id: number) {
  const res = await fetch(`/api/plan/${id}`);
  if (!res.ok) {
    throw new Error("Plan not found");
  }
  const data = await res.json();
  toast.success("Plan retrieved successfully");
  return data;
}

/**
 * Ends a user's session by logging them out.
 *
 * This function logs out a session by its unique identifier. It communicates
 * with the backend API to end the session and remove any associated session data.
 *
 * @param id - The unique identifier of the session to be logged out.
 * @throws error throw an error if the session logout fails.
 */

export async function sessionLogout(session: Session) {
  console.log("SESSION PLAN: " + session.plan);

  if (session.plan_type === "bundle" && session.plan?.minutes) {
    const subscription = await fetch(
      `/api/subscription/${session.subscription_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          length: differenceInMinutes(
            session.start_time,
            session.end_time || 0,
          ),
        }),
      },
    );
    if (subscription.ok) {
    }
  }

  if (session.plan_type === "bundle" && session.plan?.day_passes) {
    const res = await fetch(`/api/subscription/${session.subscription_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reduceDays: 1,
      }),
    });
    if (!res.ok) {
      throw new Error("Session logout failed");
    }
  }

  const res = await fetch(`api/session/${session.id}/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status !== 200) {
    throw new Error("Session logout failed");
  }
  toast.success("Session logged out successfully");
  await mutate("/api/session");
}

export async function checkExpiration(session: Session) {}

export async function logoutBundle(session: Session) {
  const supabase = await createClient();

  let isDaysPlan = false;
  let isMinutesPlan = false;

  if (session.subscription?.days_left !== null) {
    isDaysPlan = true;
  } else if (session.subscription?.time_left !== null) {
    isMinutesPlan = true;
  }

  if (!session.subscription_id) {
    throw new Error("Subscription ID is missing");
  }

  supabase.from("subscriptions").select("*").eq("id", session.subscription?.id);

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", session.subscription_id)
    .single();

  console.log(error);

  if (error || !subscription) throw new Error("Subscription not found");

  const start = new Date(session.start_time);
  const end = new Date(session.end_time || new Date());

  let updates: any = {};
  let expired = false;

  if (isMinutesPlan) {
    const usedMinutes = differenceInMinutes(end, start);
    const newTimeLeft = subscription.time_left - usedMinutes;

    updates.time_left = newTimeLeft;
    if (newTimeLeft < 0) expired = true;
  }

  if (isDaysPlan) {
    const usedDays = Math.max(1, differenceInDays(end, start)); // use at least 1 day
    const newDaysLeft = subscription.days_left - usedDays;

    updates.days_left = newDaysLeft;
    if (newDaysLeft < 0) expired = true;
  }

  const expiryDate = new Date(subscription.expiry_date);
  if (isToday(expiryDate) || isBefore(expiryDate, new Date())) {
    expired = true;
  }

  if (expired) {
    updates.status = "expired";
  }

  const { error: updateError } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", subscription.id);

  if (updateError) {
    throw new Error("Failed to update subscription");
  }

  const { data, error: sessionLogoutError } = await supabase
    .from("sessions")
    .update({ end_time: new Date(Date.now()) })
    .eq("id", session.id)
    .select();

  if (!data || sessionLogoutError) throw new Error(sessionLogoutError?.message);

  toast.success("Session logged out successfully");
  await mutate("/api/session");
}
