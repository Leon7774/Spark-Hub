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
          "w-[100%] hover:bg-gray-300 flex justify-baseline cursor-pointer",
          route === pathname && "bg-gray-800 text-white hover:bg-gray-800"
        )}
      >
        {children}
        {routeText.toString()}
      </Button>
    </Link>
  );
};
