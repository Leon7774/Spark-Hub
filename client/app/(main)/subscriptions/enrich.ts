import { Customer, SubscriptionPlan, SubscriptionActive } from "@/lib/schemas";

export const enrichSubscriptions = (
  subscriptions: SubscriptionActive[],
  customers: Customer[],
  plans: SubscriptionPlan[],
): SubscriptionActive[] => {
  subscriptions.map((subscription): SubscriptionActive => {
    const customer = customers.find(
      (value) => value.id === subscription.customer_id,
    );
    const plan = plans.find((value) => value.id === subscription.plan_id);

    subscription.customer = {
      first_name: customer?.first_name || "Unknown",
      last_name: customer?.last_name || "Unknown",
    };

    subscription.expiry_date = plan?.expiry_duration
      ? new Date(Date.now() + plan.expiry_duration * 24 * 60 * 60 * 1000)
      : null;

    subscription.plan_name = plan?.name || "Custom";

    return subscription;
  });

  return subscriptions;
};
