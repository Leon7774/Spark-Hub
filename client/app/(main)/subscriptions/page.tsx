import { DataTable } from "./data-table";
import { columns, subscriptions } from "./columns";

const Subscriptions = () => {
  const data = subscriptions;

  return <DataTable columns={columns} data={data}></DataTable>;
};
export default Subscriptions;
