import { Payment, columns } from "./columns";
import { DataTable } from "./data-table";
import { createClient } from "@/utils/supabase/server";
import { payments } from "./payments";

async function getData(): Promise<Payment[]> {
  const supabase = createClient();
  const data = await (await supabase).from("sample").select();

  console.log(data);

  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
  ];
}

export default async function DemoPage() {
  const data = payments;

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
