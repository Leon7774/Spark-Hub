"use client";

import React, { useState } from "react";
import { DataTable } from "./data-table";
import { columns, subscriptions } from "./columns";
import { TimePicker12Demo } from "./time-picker";
import { Button } from "@/components/ui/button";

const Page = () => {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Subscription Plans</h1>
      <DataTable data={subscriptions} columns={columns}></DataTable>
      <TimePicker12Demo date={date} setDate={setDate}></TimePicker12Demo>
      <Button
        className="mt-2"
        onClick={() => {
          if (date) {
            const hours = date.getHours(); // 0–23
            const minutes = date.getMinutes(); // 0–59
            const timeString = `${String(hours).padStart(2, "0")}:${String(
              minutes
            ).padStart(2, "0")}`;
            console.log(timeString); // e.g., "16:42"
          }
        }}
      >
        CL Date
      </Button>
    </div>
  );
};

export default Page;
