import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { getCustomers } from "@/app/api/customers";

export default async function Page() {
  const customers = getCustomers()

  return (
    <div className="container">
      <h1 className="font-black text-2xl mb-10">Customers</h1>
      <Button className="mb-2">Register Customer</Button>
      <DataTable columns={columns} data={customers} />
    </div>
  );
}
