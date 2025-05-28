import {Customer, Session, SubscriptionPlan} from "@/lib/schemas";
import {undefined} from "zod";

export const enrichSessions = (sessions: Session[], customers: Customer[], plans: SubscriptionPlan[]): Session[] => {
  sessions.map((session): Session => {
    const sessionPlan = plans.find(value => value.id === session.plan_id);
    const customer = customers.find(value => value.id === session.customer_id);

    session.plan_type = sessionPlan?.plan_type;
    session.plan = {
      day_passes: sessionPlan?.days_included,
      expiry: sessionPlan?.expiry_duration ? new Date(Date.now() + sessionPlan.expiry_duration * 24 * 60 * 60 * 1000) : null,
      minutes: sessionPlan?.time_included || null,
      name: sessionPlan?.name || "Custom",
      price: sessionPlan?.price || 0,
      type: sessionPlan?.plan_type || "Custom",
    }

    session.customer = {
      first_name: customer?.first_name || "Unknown",
      last_name: customer?.last_name || "Unknown",
    }

    return session;
  })

  return sessions;
};
