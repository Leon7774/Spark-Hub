import { DataTable } from "@/components/ui/data-table";
import { columns, subscriptions } from "./subscriptions";

const Subscriptions = () => {
  const data = subscriptions;

  return <DataTable columns={columns} data={data}></DataTable>;
};
export default Subscriptions;
