import { columns, data } from "./columns";
import CustomerSheet from "./customer-sheet";
import { ActiveSubscriptions } from "./data-table";

const Subscriptions = () => {
  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Customer Subscriptions</h1>
      <ActiveSubscriptions data={data} columns={columns} />
      <CustomerSheet></CustomerSheet>
    </div>
  );
};
export default Subscriptions;
