// hooks/useCustomersWithSessions.ts
import useSWR from "swr";
import { Customer, Session } from "@/lib/schemas";

export function useCustomersWithSessions() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: customers, error: customersError } = useSWR(
    "/api/customer",
    fetcher,
  );
  const { data: sessions, error } = useSWR("/api/session", fetcher);

  if (customersError || error) {
    console.error("Error fetching data:", error);
    return {
      customers: [],
      isLoading: false,
    };
  }

  // Process the data to add session status
  const customersWithSessions =
    customers?.map((customer: Customer) => ({
      ...customer,
      isInSession: sessions?.some(
        (session: Session) =>
          session.customer_id === customer.id &&
          session.start_time &&
          !session.end_time,
      ),
    })) || [];

  return {
    customers: customersWithSessions,
    isLoading: !customers || !sessions,
  };
}
