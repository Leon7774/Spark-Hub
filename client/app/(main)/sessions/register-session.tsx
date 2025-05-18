"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, InputIcon } from "@/components/ui/input";
import { Dispatch, SetStateAction, useState, useEffect } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SubscriptionTypes } from "@/utils/types";
import { PlanType, Plan, getPlansByType } from "@/app/api/plans";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";
import { PhilippinePeso, Search } from "lucide-react";
import { Customer, getCustomers } from "@/app/api/customers";

// This is the schema for customer sessions
export const SessionSchema = z.object({
  customer_id: z.number({
    required_error: "Please select a customer",
  }),
  session_type: z.enum(["subscription", "straight", "hourly", "custom"], {
    required_error: "Please select a session type",
  }),
  plan_id: z.number().nullable(),
  custom_start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, {
      message: "Time must be in HH:MM format",
    })
    .nullable(),
  custom_end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, {
      message: "Time must be in HH:MM format",
    })
    .nullable(),
  custom_price: z.number().nullable(),
});

const sessionFormSchema = SessionSchema;

export default function RegisterSessionForm({
  dialogOpenSet,
}: {
  dialogOpen: boolean;
  dialogOpenSet: Dispatch<SetStateAction<boolean>>;
}) {
  const [isLoading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [sessionType, setSessionType] = useState<string | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  // Load customers on component mount
  useEffect(() => {
    async function fetchCustomers() {
      const data = await getCustomers();
      setCustomers(data);
    }
    fetchCustomers();
  }, []);

  // Load plans when session type changes
  useEffect(() => {
    async function fetchPlans() {
      if (!sessionType || sessionType === "custom") {
        setAvailablePlans([]);
        return;
      }

      try {
        const plans = await getPlansByType(sessionType as PlanType);
        setAvailablePlans(plans);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load plans");
      }
    }

    fetchPlans();
  }, [sessionType]);

  const form = useForm<z.infer<typeof sessionFormSchema>>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      customer_id: undefined,
      session_type: undefined,
      plan_id: null,
      custom_start_time: "",
      custom_end_time: "",
      custom_price: 0,
    },
  });

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    `${customer.first_name} ${customer.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  async function onSubmit() {
    setShowDialog(true);
  }

  async function handleConfirm(values: z.infer<typeof sessionFormSchema>) {
    setLoading(true);
    console.log("Trying to register session:", values);
    dialogOpenSet(false);
    setShowDialog(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Customer Selection */}
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="Select a customer..."
                    value={
                      selectedCustomer
                        ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                        : ""
                    }
                    readOnly
                    className="cursor-pointer"
                    onClick={() => setShowCustomerDialog(true)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCustomerDialog(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Customer Selection Dialog */}
        <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Select Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${
                      selectedCustomer?.id === customer.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      form.setValue("customer_id", customer.id);
                      setShowCustomerDialog(false);
                    }}
                  >
                    {customer.first_name} {customer.last_name}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Session Type Selection */}
        <FormField
          control={form.control}
          name="session_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSessionType(value);
                }}
                value={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">
                    Subscription Plan
                  </SelectItem>
                  <SelectItem value="straight">Straight Plan</SelectItem>
                  <SelectItem value="hourly">Hourly Plan</SelectItem>
                  <SelectItem value="custom">Custom Session</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Plan Selection (for subscription, straight, and hourly) */}
        {sessionType && sessionType !== "custom" && (
          <FormField
            control={form.control}
            name="plan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Plan</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.name} - ₱{plan.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Custom Session Fields */}
        {sessionType === "custom" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="custom_start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="custom_end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="custom_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <InputIcon
                      icon={
                        <PhilippinePeso
                          size={15}
                          strokeWidth={2}
                          className="text-muted-foreground p-0"
                        />
                      }
                      type="number"
                      {...field}
                      value={field.value || 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading}>
            Register Session
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setSelectedCustomer(null);
              setSessionType(undefined);
            }}
          >
            Clear
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Session Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to register this session?
              {selectedCustomer && (
                <div className="mt-2">
                  <p>
                    Customer: {selectedCustomer.first_name}{" "}
                    {selectedCustomer.last_name}
                  </p>
                  <p>Session Type: {sessionType}</p>
                  {sessionType !== "custom" && form.getValues("plan_id") && (
                    <p>
                      Selected Plan:{" "}
                      {
                        availablePlans.find(
                          (p) => p.id === form.getValues("plan_id")
                        )?.name
                      }
                    </p>
                  )}
                  {sessionType === "custom" && (
                    <>
                      <p>
                        Time: {form.getValues("custom_start_time")} -{" "}
                        {form.getValues("custom_end_time")}
                      </p>
                      <p>Price: ₱{form.getValues("custom_price")}</p>
                    </>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirm(form.getValues())}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
