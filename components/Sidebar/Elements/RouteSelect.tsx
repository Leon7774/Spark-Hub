import { ArrowLeftRight, Logs, SquareChartGantt, User } from "lucide-react";
import { RouteButton } from "./RouteButton";

export const RouteSelect = () => {
  return (
    <div className="mt-6 flex flex-col justify-center gap-2">
      <RouteButton routeText="Sessions">
        <SquareChartGantt strokeWidth={2.75} className="mr-2" />
      </RouteButton>
      <RouteButton routeText="Customers">
        <User strokeWidth={3} className="mr-2" />
      </RouteButton>
      <RouteButton routeText="Transactions">
        <ArrowLeftRight strokeWidth={3} className="mr-2" />
      </RouteButton>
      <RouteButton routeText="Log">
        <Logs strokeWidth={3} className="mr-2" />
      </RouteButton>
      <RouteButton routeText="gyatt">
        <Logs strokeWidth={3} className="mr-2" />
      </RouteButton>
    </div>
  );
};
