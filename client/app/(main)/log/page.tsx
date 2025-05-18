import React from "react";
import { ActionLogsTable } from "./data-table";
import { columns, subscriptions } from "./columns";

const page = () => {
  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Activity Log</h1>

      <ActionLogsTable />
    </div>
  );
};

export default page;
