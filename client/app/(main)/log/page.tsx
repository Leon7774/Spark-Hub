import React from "react";
import { LogTable } from "./data-table";
import { columns, subscriptions } from "./columns";

const page = () => {
  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Activity Log</h1>

      <LogTable data={subscriptions} columns={columns}></LogTable>
    </div>
  );
};

export default page;
