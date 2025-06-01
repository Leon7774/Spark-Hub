"use client";

import { columns } from "./columns";
import { ActiveSubscriptions } from "./data-table";
import useSWR from "swr";
import { SubscriptionActive, subscriptionActiveSchema } from "@/lib/schemas";
import { format } from "date-fns";
import { enrichSubscriptions } from "./enrich";
import { TableLoading } from "@/app/(main)/plans/loading";

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
    enrichedData = enrichSubscriptions(data.data, customers, plans);
  }

  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Customer Subscriptions</h1>
      {data ? (
        <ActiveSubscriptions data={enrichedData} columns={columns} />
      ) : (
        <TableLoading></TableLoading>
      )}
    </div>
  );
};

export default Subscriptions;
