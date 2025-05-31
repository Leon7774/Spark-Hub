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
  className,
}: {
  routeText: string;
  route: string;
  children?: ReactNode;
  className?: string;
}) => {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <Link href={route}>
      <Button
        variant={"ghost"}
        className={clsx(
          " w-[100%] hover:bg-accent2 flex h-9 justify-baseline cursor-pointer overflow-visible " +
            className,
          route === pathname && "bg-accent2 ",
        )}
      >
        {children}
        {routeText.toString()}
      </Button>
    </Link>
  );
};
