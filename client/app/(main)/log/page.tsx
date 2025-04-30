import React from "react";
import { DataTable } from "./data-table";
import { columns, subscriptions } from "./columns";

const page = () => {
  return (
    <div>
      <h1 className="text-4xl font-black mb-4">Activity Log</h1>
      <DataTable data={subscriptions} columns={columns}></DataTable>
    </div>
  );
};

export default page;
