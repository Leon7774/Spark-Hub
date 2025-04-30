import {
  Logs,
  NotebookText,
  SquareChartGantt,
  SquarePercent,
  User,
} from "lucide-react";
import { RouteButton } from "./Nav-Button";

export const RouteSelect = () => {
  return (
    <div className="mt-6 flex flex-col justify-center gap-4">
      {/* Button for sessions */}
      <RouteButton route="/sessions" routeText="Sessions">
        <SquareChartGantt strokeWidth={2} className="mr-2 size-6" />
      </RouteButton>
      {/* Button for customers */}
      <RouteButton route="/customers" routeText="Customers">
        <User strokeWidth={2} className="mr-2 size-6" />
      </RouteButton>
      {/* Button for subscriptions */}
      <RouteButton route="/subscriptions" routeText="Subscriptions">
        <NotebookText strokeWidth={2} className="mr-2 size-6"></NotebookText>
      </RouteButton>
      <RouteButton route="/plans" routeText="Plans">
        <SquarePercent strokeWidth={2} className="mr-2 size-6" />
      </RouteButton>
      <RouteButton route="/log" routeText="Log">
        <Logs strokeWidth={2} className="mr-2 size-6"></Logs>
      </RouteButton>
    </div>
  );
};
