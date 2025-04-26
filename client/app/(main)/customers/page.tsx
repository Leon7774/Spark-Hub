import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Customer } from "@/utils/types";
import { Client as supabase } from "@/utils/supabase/client";
import { z } from "zod";

async function getData(): Promise<Customer[]> {
  const data: Customer[] = await supabase.from("customers").select("*")
    .overrideTypes<Customer, { merge: false }>;

  return data ?? [];
}

export default async function DemoPage() {
  const data = getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
