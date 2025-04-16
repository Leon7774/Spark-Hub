"use client";

import { DataTableDemo } from "@/components/Content/Elements/Table/Table";

export async function wait() {
  new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}

const Sessions = () => {
  return (
    <div>
      <h1 className="font-black text-2xl">Sessions</h1>
      <DataTableDemo></DataTableDemo>
    </div>
  );
};
export default Sessions;
