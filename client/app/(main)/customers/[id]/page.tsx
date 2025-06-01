"use client";

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
import { format } from "date-fns";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Customer, Session, SubscriptionActive } from "@/lib/schemas";
import useSWR from "swr";

interface CustomerDetails extends Customer {
  subscriptions: SubscriptionActive[];
  sessions: Session[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CustomerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const {
    data: customer,
    error,
    isLoading,
  } = useSWR<CustomerDetails>(`/api/customer/${customerId}`, fetcher);

  const getSubscriptionStatusBadge = (subscription: SubscriptionActive) => {
    if (!subscription.expiry_date)
      return <Badge variant="outline">No Expiry</Badge>;

    const now = new Date();
    const expiryDate = new Date(subscription.expiry_date);

    if (expiryDate < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (subscription.time_left && subscription.time_left <= 0) {
      return <Badge variant="destructive">Time Used</Badge>;
    }

    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getCustomerStatusBadge = (hasActiveSubscriptions: boolean) => {
    return hasActiveSubscriptions ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="outline">Inactive</Badge>
    );
  };

  if (isLoading) {
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
        <div className="text-red-500">
          {error?.message || "Customer not found"}
        </div>
      </div>
    );
  }

  const activeSubscriptions =
    customer.subscriptions?.filter((sub) => {
      if (!sub.expiry_date) return true;
      const now = new Date();
      const expiryDate = new Date(sub.expiry_date);
      return expiryDate > now && (!sub.time_left || sub.time_left > 0);
    }).length || 0;

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
            {getCustomerStatusBadge(activeSubscriptions > 0)}
          </div>
          <p className="text-muted-foreground mt-1">
            Member since {format(new Date(customer.created_at), "MMMM d, yyyy")}
          </p>
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
            {activeSubscriptions} active plans
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
                          {getSubscriptionStatusBadge(sub)}
                          {sub.time_left !== null && (
                            <span className="text-sm text-muted-foreground">
                              {sub.time_left} min left
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
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

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              Latest actions performed by or for this customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customer.sessions?.length > 0 ? (
              <div className="space-y-4">
                {customer.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-lg">
                          {session.plan?.name || "Custom Session"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {session.plan_type || "Custom"}
                          </Badge>
                          {session.end_time ? (
                            <Badge variant="outline">Completed</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Started{" "}
                          {format(
                            new Date(session.start_time),
                            "MMM d, h:mm a"
                          )}
                        </p>
                        {session.end_time && (
                          <p className="text-sm text-muted-foreground">
                            Ended{" "}
                            {format(
                              new Date(session.end_time),
                              "MMM d, h:mm a"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No sessions found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This customer hasn&#39;t had any sessions yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
