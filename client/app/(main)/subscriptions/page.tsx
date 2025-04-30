import { ActiveSubscriptions } from "./data-table";
import { columns, subscriptions } from "./columns";

const Subscriptions = () => {
  const data = subscriptions;

  return (
    <div>
      <h1 className="text-4xl font-black mb-4">Customer Subscriptions</h1>
      <ActiveSubscriptions />
    </div>
  );
};
export default Subscriptions;
