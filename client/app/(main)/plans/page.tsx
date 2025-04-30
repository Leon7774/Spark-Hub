import React from "react";
import { DataTable } from "./data-table";
import { columns, subscriptions } from "./columns";

const page = () => {
  return (
    <div>
      <h1>Subscription Plans</h1>
      <DataTable data={subscriptions} columns={columns}></DataTable>
    </div>
  );
};

export default page;
