"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { useDataContext } from "@/context/dataContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import RegisterCustomerForm from "./register-customer";
import useSWR from "swr";

// TODO: Use swr instead of datacontext
const fetcher = (url: string) => fetch(url).then((res) => res.json());

await fetch("/api/customer/5/subscriptions");

export default function Page() {
  const { customers } = useDataContext();
  const [open, setOpen] = useState(false);

  return (
    <div className="container">
      <h1 className="text-4xl font-black mb-8">Customers</h1>

      <div className="mb-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger onClick={() => setOpen(true)}>
            <Button className="mb-2">Register Customer</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="pt-5">
              <DialogTitle>Register Customer</DialogTitle>
              <DialogDescription>
                Register a new Spark-Lab customer here. Click save when
                you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <RegisterCustomerForm
              dialogOpen={open}
              dialogOpenSet={setOpen}
            ></RegisterCustomerForm>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={customers} />
    </div>
  );
}
