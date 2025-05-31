"use client";

import React from "react";
import { SubscriptionPlansTable } from "./data-table";
import { columns } from "./columns";
import useSWR from "swr";
import RegisterButton from "./register-button";
import { TableLoading } from "./loading";

// TODO:
// - Add ability to delete plans
// - - Deactivate plan
// - - Delete plan
// - Add ability to update plans

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Page = () => {
  const { data, isLoading, error } = useSWR("/api/plan", fetcher);

  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Session Plans</h1>
      <div className="flex items-center justify-between pb-10">
        <div>
          <p className="text-muted-foreground">
            Manage your subscription plans and pricing.
          </p>
        </div>
        <RegisterButton />
      </div>
      {isLoading && <TableLoading />}
      {error && <div className="text-red-500">Failed to load plans.</div>}
      {data && <SubscriptionPlansTable data={data} columns={columns} />}
    </div>
  );
};

export default Page;
