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
import { PlanType, Plan } from "@/app/api/plans";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";
import { PhilippinePeso, Search } from "lucide-react";
import { Customer } from "@/app/api/customers";
import { createClient } from "@/utils/supabase/client";

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
  dialogOpen,
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

  function getPlanId(planName: string) {
    return availablePlans.find((plan) => plan.name === planName)?.id;
  }

  // Load customers and plans
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = await createClient();

        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("*");

        if (customersError) throw customersError;
        setCustomers(customersData || []);

        // Fetch plans if session type is set
        if (sessionType && sessionType !== "custom") {
          const { data: plansData, error: plansError } = await supabase
            .from("subscription_plans")
            .select("*")
            .eq("plan_type", sessionType)
            .eq("is_active", true);

          if (plansError) throw plansError;
          setAvailablePlans(plansData || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      }
    }

    loadData();
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
    try {
      const supabase = await createClient();

      // Create session data
      const sessionData = {
        customer_id: values.customer_id,
        session_type: values.session_type,
        plan_id: values.plan_id,
        start_time:
          values.session_type === "custom"
            ? values.custom_start_time
            : new Date().toISOString(),
        end_time:
          values.session_type === "custom" ? values.custom_end_time : null,
        price: values.session_type === "custom" ? values.custom_price : null,
        status: "active",
      };

      // Insert session into Supabase
      const { error } = await supabase.from("sessions").insert(sessionData);

      if (error) throw error;

      toast.success("Session registered successfully");
      dialogOpenSet(false);
      setShowDialog(false);
      form.reset();
      setSelectedCustomer(null);
      setSessionType(undefined);
    } catch (error) {
      console.error("Error registering session:", error);
      toast.error("Failed to register session");
    } finally {
      setLoading(false);
    }
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
                  <SelectValue placeholder="Select a session type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="straight">Straight</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Plan Selection */}
        {sessionType && sessionType !== "custom" && (
          <FormField
            control={form.control}
            name="plan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Plan</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
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

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register Session"}
        </Button>
      </form>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Session Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to register this session? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirm(form.getValues())}
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
