"use client";

import React from "react";
import { SubscriptionPlansTable } from "./data-table";
import { columns, subscriptionPlans } from "./columns";

import RegisterButton from "./register-button";

const Page = () => {
  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Subscription Plans</h1>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Subscription Plans
          </h2>
          <p className="text-muted-foreground">
            Manage your subscription plans and pricing
          </p>
        </div>
        <RegisterButton></RegisterButton>
      </div>
      <SubscriptionPlansTable
        data={subscriptionPlans}
        columns={columns}
      ></SubscriptionPlansTable>
    </div>
  );
};

export default Page;
