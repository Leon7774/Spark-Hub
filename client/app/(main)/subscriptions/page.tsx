"use client";

import { columns } from "./columns";
import CustomerSheet from "./customer-sheet";
import { ActiveSubscriptions } from "./data-table";
import useSWR from "swr";
import { SubscriptionActive, subscriptionActiveSchema } from "@/lib/schemas";
import { format } from "date-fns";
import { enrichSubscriptions } from "./enrich";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Subscriptions = () => {
  const { data, error, isLoading } = useSWR("/api/subscription", fetcher);
  const { data: customers, isLoading: customersLoading } = useSWR(
    "/api/customer",
    fetcher,
  );
  const { data: plans, isLoading: plansLoading } = useSWR("/api/plan", fetcher);

  let enrichedData: SubscriptionActive[] = [];

  if (!isLoading && !customersLoading && !plansLoading) {
    enrichedData = enrichSubscriptions(data, customers, plans);
  }

  console.log(error);
  console.log(isLoading);
  console.log(data);

  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Customer Subscriptions</h1>
      {data && <ActiveSubscriptions data={enrichedData} columns={columns} />}
      <CustomerSheet></CustomerSheet>
    </div>
  );
};

export default Subscriptions;
