// hooks/useCustomersWithSessions.ts
import useSWR from "swr";
import { Customer, Session, SubscriptionActive } from "@/lib/schemas";

export function useCustomersWithSessions(customer: Customer) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data: sessions, error: sessionsError } = useSWR(
    "/api/session",
    fetcher,
  );
  const { data: subscriptions, error: subscriptionsError } = useSWR(
    "/api/subscription",
    fetcher,
  );

  if (sessionsError || subscriptionsError) {
    console.error("Error fetching data:", sessionsError, subscriptionsError);
  }
  // Process the data to add session status
  const customerSessions = sessions?.filter(
    (session: Session) => session.customer_id === customer.id,
  );

  const customerSubscriptions = subscriptions?.filter(
    (subscriptions: SubscriptionActive) =>
      subscriptions.customer_id === customer.id,
  );

  return {
    sessions: customerSessions,
    subscriptions: customerSubscriptions,
  };
}
