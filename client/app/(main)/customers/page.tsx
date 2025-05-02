"use client";

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { Customer, getCustomers } from "@/app/api/customers";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import RegisterCustomerForm from "./register_customer";

export default function Page() {
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);

  // Loads
  useEffect(() => {
    async function fetchCustomers() {
      const data = await getCustomers();
      setCustomers(data); // This correctly updates the customers state
    }

    fetchCustomers();
  }, []);

  return (
    <div className="container">
      <h1 className="text-4xl font-black mb-4">Customers</h1>

      <div className="mb-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger onClick={() => setOpen(true)}>
            <Button className="mb-2">Register Customer</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="pt-5">
              <DialogTitle>Register Customer</DialogTitle>
              <DialogDescription>
                Register a new Spark-Lab customer here. Click save when you're
                done.
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
