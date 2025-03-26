import { Button } from "@/components/ui/button";
import { ContentType, PageContext } from "../../../context/context";
import clsx from "clsx";
import { useContext } from "react";

export const RouteButton = ({
  routeText,
  children,
}: {
  routeText: string;
  children?: React.ReactNode;
}) => {
  const data = useContext(PageContext);
  const selected = data.content === routeText.toLocaleLowerCase();

  return (
    <Button
      variant={"ghost"}
      className={clsx(
        "w-[100%] transition-colors hover:bg-gray-300",
        selected && "bg-gray-800 text-white hover:bg-gray-800",
      )}
      onClick={() =>
        data.setContent(routeText.toLocaleLowerCase() as ContentType)
      }
    >
      {children}
      {routeText.toString()}
    </Button>
  );
};
