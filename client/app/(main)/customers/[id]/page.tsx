"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, subDays, addDays } from "date-fns";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: number;
  plan_name: string;
  plan_type: string;
  created_at: string;
  expiry_date: string;
  status: "active" | "expired" | "cancelled";
  time_left: number | null;
  price: number;
}

interface CustomerDetails {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  created_at: string;
  total_spent: number;
  total_hours: number;
  active_subscriptions: number;
  subscriptions: Subscription[];
}

// Dummy subscription data
const DUMMY_SUBSCRIPTIONS = [
  {
    id: 1,
    plan_name: "Premium Monthly",
    plan_type: "bundle",
    created_at: subDays(new Date(), 15).toISOString(),
    expiry_date: addDays(new Date(), 15).toISOString(),
    status: "active" as const,
    time_left: 7200, // 120 hours in minutes
    price: 1200,
  },
  {
    id: 2,
    plan_name: "Hourly Package",
    plan_type: "hourly",
    created_at: subDays(new Date(), 30).toISOString(),
    expiry_date: addDays(new Date(), -5).toISOString(),
    status: "expired" as const,
    time_left: 0,
    price: 500,
  },
  {
    id: 3,
    plan_name: "Basic Weekly",
    plan_type: "straight",
    created_at: subDays(new Date(), 60).toISOString(),
    expiry_date: subDays(new Date(), 25).toISOString(),
    status: "expired" as const,
    time_left: null,
    price: 300,
  },
];

// Dummy customer data
const DUMMY_CUSTOMER: CustomerDetails = {
  id: 1,
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  created_at: subDays(new Date(), 65).toISOString(),
  total_spent: 2000,
  total_hours: 85.5,
  active_subscriptions: 1,
  subscriptions: DUMMY_SUBSCRIPTIONS,
};

export default function CustomerDetailsPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      try {
        setCustomer(DUMMY_CUSTOMER);
      } catch (err) {
        setError("Failed to load customer data");
        toast.error("Failed to load customer details");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container py-8">
        <div className="text-red-500">{error || "Customer not found"}</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
      </Button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              {customer.first_name} {customer.last_name}
            </h1>
            {getStatusBadge(
              customer.active_subscriptions > 0 ? "active" : "inactive",
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Member since {format(new Date(customer.created_at), "MMMM d, yyyy")}
          </p>

          {customer.email && (
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              {customer.email}
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <span className="mr-2">📱</span>
              {customer.phone}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="text-base px-4 py-2 gap-2">
            <Clock className="h-4 w-4" />
            {customer.total_hours.toFixed(1)} hours
          </Badge>
          <Badge variant="outline" className="text-base px-4 py-2 gap-2">
            <DollarSign className="h-4 w-4" />₱{customer.total_spent.toFixed(2)}
          </Badge>
          <Badge variant="outline" className="text-base px-4 py-2 gap-2">
            <Calendar className="h-4 w-4" />
            {customer.active_subscriptions} active plans
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Subscription History */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
            <CardDescription>
              All subscription plans purchased by this customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customer.subscriptions?.length > 0 ? (
              <div className="space-y-4">
                {customer.subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-lg">{sub.plan_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{sub.plan_type}</Badge>
                          {getStatusBadge(sub.status)}
                          {sub.time_left !== null && (
                            <span className="text-sm text-muted-foreground">
                              {sub.time_left} min left
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₱{sub.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(sub.created_at), "MMM d, yyyy")}
                          {sub.expiry_date && (
                            <span>
                              {" • "}Expires{" "}
                              {format(new Date(sub.expiry_date), "MMM d, yyyy")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No subscriptions found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This customer hasn&#39;t purchased any subscription plans yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions performed by or for this customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Activity log coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
