import {
  Customer,
  Session,
  SubscriptionActive,
  SubscriptionPlan,
} from "@/lib/schemas";
import { undefined } from "zod";

export const enrichSessions = (
  sessions: Session[],
  customers: Customer[],
  plans: SubscriptionPlan[],
  subscription: SubscriptionActive[]
): Session[] => {
  sessions.map((session): Session => {
    const sessionPlan = plans.find((value) => value.id === session.plan_id);
    const customer = customers.find(
      (value) => value.id === session.customer_id
    );

    session.plan_type = sessionPlan?.plan_type;
    session.plan = {
      day_passes: sessionPlan?.days_included,
      expiry: sessionPlan?.expiry_duration
        ? new Date(
            Date.now() + sessionPlan.expiry_duration * 24 * 60 * 60 * 1000
          )
        : null,
      minutes: sessionPlan?.time_included || null,
      name: sessionPlan?.name || "Custom",
      price: sessionPlan?.price || 0,
      type: sessionPlan?.plan_type || "Custom",
    };

    const currentSubscription = subscription.find(
      (s) => s.id === session.subscription_id
    );

    session.subscription = {
      expiry_date: currentSubscription?.expiry_date,
      days_left: currentSubscription?.days_left,
      time_left: currentSubscription?.time_left,
    };

    session.customer = {
      first_name: customer?.first_name || "Unknown",
      last_name: customer?.last_name || "Unknown",
    };

    return session;
  });

  return sessions;
};
