import {
  Logs,
  LucideTimer,
  NotebookText,
  SquareChartGantt,
  SquarePercent,
  User,
} from "lucide-react";
import { RouteButton } from "./Nav-Button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const RouteSelect = () => {
  return (
    <div className="mt-6 flex flex-col justify-center gap-2">
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

      <Collapsible className="group/collapsible">
        <CollapsibleTrigger asChild>
          <Link href="/session_log">
            <Button
              variant="ghost"
              className="w-[100%] hover:bg-accent2 flex h-9 justify-baseline cursor-pointer overflow-visible"
            >
              <Logs strokeWidth={2} className="mr-2 size-6" />
              Log
            </Button>
          </Link>
        </CollapsibleTrigger>
        <div className="flex">
          <CollapsibleContent className="bg-accent2 w-0.5 h-20"></CollapsibleContent>
          <div className="flex flex-col gap-2 mt-1 ml-2">
            <CollapsibleContent>
              <RouteButton route="/log" routeText="Activity Log"></RouteButton>
            </CollapsibleContent>
            <CollapsibleContent>
              <RouteButton
                route="/session_log"
                routeText="Session Log"
              ></RouteButton>
            </CollapsibleContent>
          </div>
        </div>
      </Collapsible>
    </div>
  );
};
