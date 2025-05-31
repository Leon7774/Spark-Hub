"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
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
import { Plan } from "@/app/api/plans";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Customer } from "@/app/api/customers";
import { createClient } from "@/utils/supabase/client";
import { mutate } from "swr";

// Schema specifically for BUNDLE subscriptions
export const bundleSubscriptionSchema = z.object({
  customer_id: z.number({
    required_error: "Customer is required.",
  }),
  plan_id: z.number({
    required_error: "Bundle plan is required.",
  }),
  expiry_date: z.date().nullable().optional(),
  created_at: z.date().nullable().optional(),
  time_left: z
    .number({
      required_error: "Time left is required.",
    })
    .optional(),
  days_left: z
    .number({
      required_error: "Days left is required.",
    })
    .optional(),
});

type BundleSubscriptionFormValues = z.infer<typeof bundleSubscriptionSchema>;

export default function BundleSubscriptionForm({
  dialogOpen,
  dialogOpenSet,
}: {
  dialogOpen: boolean;
  dialogOpenSet: Dispatch<SetStateAction<boolean>>;
}) {
  const [isLoading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bundlePlans, setBundlePlans] = useState<Plan[]>([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  // Load customers and BUNDLE plans only
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();

        // TODO: Make this into an api call
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("*");

        if (customersError) throw customersError;
        setCustomers(customersData || []);

        // TODO: Make this into an api call
        // Fetch ONLY BUNDLE plans
        const { data: bundlePlansData, error: bundlePlansError } =
          await supabase
            .from("subscription_plans")
            .select("*")
            .eq("plan_type", "bundle") // Only BUNDLE plans
            .eq("is_active", true);

        if (bundlePlansError) throw bundlePlansError;
        setBundlePlans(bundlePlansData || []);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      }
    }

    loadData();
  }, []);

  const form = useForm<BundleSubscriptionFormValues>({
    resolver: zodResolver(bundleSubscriptionSchema),
    defaultValues: {
      customer_id: undefined,
      plan_id: undefined,
    },
  });

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    `${customer.first_name} ${customer.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  async function onSubmit() {
    setShowDialog(true);
  }

  async function handleConfirm(values: BundleSubscriptionFormValues) {
    setLoading(true);
    try {
      const supabase = createClient();

      const selectedPlan = bundlePlans.find(
        (plan) => plan.id === values.plan_id,
      );

      if (!selectedPlan) {
        toast.error("Selected bundle plan not found.");
        setLoading(false);
        setShowDialog(false);
        return;
      }

      // Check if customer already has an active subscription for this plan
      const { data: existingSubscription, error: checkError } = await supabase
        .from("active_subscriptions")
        .select("*")
        .eq("customer_id", values.customer_id)
        .eq("plan_id", values.plan_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingSubscription) {
        toast.error(
          "Customer already has an active subscription for this bundle plan.",
        );
        setLoading(false);
        setShowDialog(false);
        return;
      }

      // Calculate expiry date if plan has expiry duration
      values.expiry_date = selectedPlan.expiry_duration
        ? new Date(Date.now() + selectedPlan.expiry_duration)
        : null;

      values.created_at = new Date(Date.now());

      // Create new bundle subscription

      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status} ${JSON.stringify(responseData)}`,
        );
      }

      toast.success(
        `Successfully subscribed ${selectedCustomer?.first_name} ${selectedCustomer?.last_name} to ${selectedPlan.name} bundle!`,
      );

      dialogOpenSet(false);
      setShowDialog(false);
      form.reset();
      setSelectedCustomer(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Error creating bundle subscription:", error);
      toast.error("Failed to create bundle subscription");
    } finally {
      setLoading(false);
    }
  }

  const getConfirmationMessage = () => {
    const values = form.getValues();
    const selectedPlan = bundlePlans.find((plan) => plan.id === values.plan_id);
    const customerName = selectedCustomer
      ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
      : "the selected customer";

    return `Are you sure you want to subscribe ${customerName} to the ${selectedPlan?.name} bundle for ₱${selectedPlan?.price}? This will create a new active subscription.`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 ${
                        selectedCustomer?.id === customer.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        form.setValue("customer_id", customer.id);
                        setShowCustomerDialog(false);
                        setSearchQuery("");
                      }}
                    >
                      <div className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    No customers found
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bundle Plan Selection */}
        <FormField
          control={form.control}
          name="plan_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bundle Plan</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString() || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a bundle plan" />
                </SelectTrigger>
                <SelectContent>
                  {bundlePlans.length > 0 ? (
                    bundlePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.name} - ₱{plan.price}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-plans" disabled>
                      No bundle plans available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading || !selectedCustomer || !form.watch("plan_id")}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Create Bundle Subscription"}
        </Button>
      </form>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bundle Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirm(form.getValues())}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
