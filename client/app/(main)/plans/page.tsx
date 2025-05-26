"use client";

import React, { useEffect, useState } from "react";
import { SubscriptionPlansTable } from "./data-table";
import { columns, subscriptionPlans } from "./columns";
import { useDataContext } from "@/context/dataContext";

import RegisterButton from "./register-button";

const Page = () => {
  const { plans, loading } = useDataContext();

  useEffect(() => {
    console.log(plans);
  }, [loading]);

  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Subscription Plans</h1>
      <div className="flex items-center justify-between pb-10">
        <div>
          <p className="text-muted-foreground">
            Manage your subscription plans and pricing.
          </p>
        </div>
        <RegisterButton></RegisterButton>
      </div>
      {!loading ? (
        <SubscriptionPlansTable
          data={plans}
          columns={columns}
        ></SubscriptionPlansTable>
      ) : (
        <div>Loadig</div>
      )}
    </div>
  );
};

export default Page;
