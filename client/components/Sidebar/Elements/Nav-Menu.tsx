import { NotebookText, SquareChartGantt, User } from "lucide-react";
import { RouteButton } from "./Nav-Button";

export const RouteSelect = () => {
  return (
    <div className="mt-6 flex flex-col justify-center gap-2">
      {/* Button for sessions */}
      <RouteButton route="/sessions" routeText="Sessions">
        <SquareChartGantt strokeWidth={2.75} className="mr-2" />
      </RouteButton>
      {/* Button for customers */}
      <RouteButton route="/customers" routeText="Customers">
        <User strokeWidth={3} className="mr-2" />
      </RouteButton>
      {/* Button for subscriptions */}
      <RouteButton route="/subscriptions" routeText="Subscriptions">
        <NotebookText strokeWidth={3} className="mr-2"></NotebookText>
      </RouteButton>
      <RouteButton route="/subscriptions" routeText="Subscriptions">
        <NotebookText strokeWidth={3} className="mr-2"></NotebookText>
      </RouteButton>
    </div>
  );
};
