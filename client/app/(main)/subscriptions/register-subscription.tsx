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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const subscriptionActiveSchema = z.object({
  created_at: z.preprocess((val) => new Date(val as string), z.date()), // or z.date() if it's ISO format already parsed
  customer_id: z.number(),
  plan_id: z.number(),
  expiry_date: z.date(),
  time_left: z.number().nullable(),
  days_left: z.number().nullable(),
});

const registrationFormSchema = subscriptionActiveSchema;

export default function EnhancedRegistrationForm({
  dialogOpen,
  dialogOpenSet,
}: {
  dialogOpen: boolean;
  dialogOpenSet: Dispatch<SetStateAction<boolean>>;
}) {
  const [isLoading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [registrationType, setRegistrationType] = useState<string>("session");
  const [sessionType, setSessionType] = useState<string | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

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

        // Fetch all plans for plan purchase
        const { data: allPlansData, error: allPlansError } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("is_active", true);

        if (allPlansError) throw allPlansError;
        setAllPlans(allPlansData || []);

        // Fetch plans for session if session type is set
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

  const form = useForm<z.infer<typeof registrationFormSchema>>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      created_at: undefined,
      customer_id: undefined,
      plan_id: undefined,
      expiry_date: undefined,
      time_left: null,
      days_left: null,
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

  async function handleConfirm(values: z.infer<typeof registrationFormSchema>) {
    setLoading(true);
    try {
      // TODO: Implement transaction log

      dialogOpenSet(false);
      setShowDialog(false);
      form.reset();
      setSelectedCustomer(null);
      setSessionType(undefined);
      setRegistrationType("session");
    } catch (error) {
      console.error("Error processing registration:", error);
      toast.error("Failed to process registration");
    } finally {
      setLoading(false);
    }
  }

  const getConfirmationMessage = () => {
    const values = form.getValues();
    if (values.registration_type === "session") {
      return "Are you sure you want to register this session? This action cannot be undone.";
    } else {
      const selectedPlan = allPlans.find(
        (plan) => plan.id === values.purchase_plan_id,
      );
      return `Are you sure you want to purchase the ${selectedPlan?.name} plan for ₱${selectedPlan?.price}? This will charge the customer and activate their subscription.`;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Registration Type Selection */}
        <FormField
          control={form.control}
          name="registration_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Type</FormLabel>
              <Tabs
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setRegistrationType(value);
                  // Reset form when switching types
                  form.setValue("session_type", null);
                  form.setValue("plan_id", null);
                  form.setValue("purchase_plan_id", null);
                  setSessionType(undefined);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="session">Start Session</TabsTrigger>
                  <TabsTrigger value="plan_purchase">Purchase Plan</TabsTrigger>
                </TabsList>
              </Tabs>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {/* Session Registration Fields */}
        {registrationType === "session" && (
          <>
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
                    value={field.value || ""}
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

            {/* Plan Selection for Sessions */}
            {sessionType && sessionType !== "custom" && (
              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Plan</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ""}
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
                          <Input
                            type="time"
                            {...field}
                            value={field.value || ""}
                          />
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
                          <Input
                            type="time"
                            {...field}
                            value={field.value || ""}
                          />
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
          </>
        )}

        {/* Plan Purchase Fields */}
        {registrationType === "plan_purchase" && (
          <FormField
            control={form.control}
            name="purchase_plan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Plan to Purchase</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString() || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a plan to purchase" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {plan.name} - ₱{plan.price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {plan.plan_type} •
                            {plan.time_included &&
                              ` ${plan.time_included} mins`}
                            {plan.days_included &&
                              ` ${plan.days_included} days`}
                            {plan.expiry_duration &&
                              ` • Expires in ${plan.expiry_duration} days`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? registrationType === "session"
              ? "Registering..."
              : "Processing..."
            : registrationType === "session"
              ? "Register Session"
              : "Purchase Plan"}
        </Button>
      </form>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {registrationType === "session"
                ? "Confirm Session Registration"
                : "Confirm Plan Purchase"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirm(form.getValues())}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
