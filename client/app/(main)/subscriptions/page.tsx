import { columns, data } from "./columns";
import { ActiveSubscriptions } from "./data-table";

const Subscriptions = () => {
  return (
    <div>
      <h1 className="text-4xl font-black mb-8">Customer Subscriptions</h1>
      <ActiveSubscriptions data={data} columns={columns} />
    </div>
  );
};
export default Subscriptions;
