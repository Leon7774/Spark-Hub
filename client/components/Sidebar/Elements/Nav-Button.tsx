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
          "w-[100%] hover:bg-accent2 flex h-9 justify-baseline cursor-pointer overflow-visible",
          route === pathname && "bg-accent2 "
        )}
      >
        {children}
        {routeText.toString()}
      </Button>
    </Link>
  );
};
