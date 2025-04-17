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
          route === pathname &&
            "bg-black text-white hover:bg-black hover:text-white"
        )}
      >
        {children}
        {routeText.toString()}
      </Button>
    </Link>
  );
};
