"use client";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export const RouteButton = ({
  routeText,
  route,
  children,
}: {
  routeText: string;
  route: string;
  children: ReactNode;
}) => {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <Link href={route}>
      <Button
        variant={"ghost"}
        className={clsx(
          "w-[100%] hover:bg-gray-300 text-lg flex justify-baseline cursor-pointer overflow-visible",
          route === pathname && "bg-accent  hover:bg-black hover:text-white "
        )}
      >
        {children}
        {routeText.toString()}
      </Button>
    </Link>
  );
};
