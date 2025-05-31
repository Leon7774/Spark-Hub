"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FinancialTransaction {
  id: string;
  date: Date;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
}

type TimeFilter = "today" | "thisWeek" | "thisMonth" | "custom";

export default function FinancialLog() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    FinancialTransaction[]
  >([]);
  const [dateRange, setDateRange] = useState<
    { from: Date; to: Date } | undefined
  >();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(true);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const mockData: FinancialTransaction[] = [
      {
        id: "1",
        date: new Date(),
        type: "income",
        category: "Subscription",
        amount: 99.99,
        description: "Monthly subscription payment",
      },
      {
        id: "2",
        date: new Date(),
        type: "expense",
        category: "Server Costs",
        amount: 50.0,
        description: "AWS server hosting",
      },
      // Add more mock data as needed
    ];
    setTransactions(mockData);
    setFilteredTransactions(mockData);
  }, []);

  // const handleAuth = () => {
  //   // Replace with your actual superadmin password check
  //   if (password === "superadmin123") {
  //     setIsAuthenticated(true);
  //     setShowAuthDialog(false);
  //   } else {
  //     alert("Invalid password");
  //   }
  // };

  // Calculate statistics
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions];

    // Apply time filter
    if (timeFilter === "today") {
      const today = new Date();
      filtered = filtered.filter(
        (t) => t.date >= startOfDay(today) && t.date <= endOfDay(today)
      );
    } else if (timeFilter === "thisWeek") {
      const today = new Date();
      filtered = filtered.filter(
        (t) => t.date >= startOfWeek(today) && t.date <= endOfWeek(today)
      );
    } else if (timeFilter === "thisMonth") {
      const today = new Date();
      filtered = filtered.filter(
        (t) => t.date >= startOfMonth(today) && t.date <= endOfMonth(today)
      );
    } else if (timeFilter === "custom" && dateRange) {
      filtered = filtered.filter(
        (t) => t.date >= dateRange.from && t.date <= dateRange.to
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [
    transactions,
    dateRange,
    typeFilter,
    categoryFilter,
    searchQuery,
    timeFilter,
  ]);

  // if (!isAuthenticated) {
  //   return (
  //     <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
  //       <DialogContent>
  //         <DialogHeader>
  //           <DialogTitle>Superadmin Authentication Required</DialogTitle>
  //         </DialogHeader>
  //         <div className="space-y-4">
  //           <Input
  //             type="password"
  //             placeholder="Enter superadmin password"
  //             value={password}
  //             onChange={(e) => setPassword(e.target.value)}
  //           />
  //           <Button onClick={handleAuth} className="w-full">
  //             Authenticate
  //           </Button>
  //         </div>
  //       </DialogContent>
  //     </Dialog>
  //   );
  // }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Financial Log</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${totalIncome.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              ${totalExpenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                netBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${netBalance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Select
          value={timeFilter}
          onValueChange={(value: TimeFilter) => setTimeFilter(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="thisWeek">This Week</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        {timeFilter === "custom" && (
          <DateRangePicker
            value={dateRange}
            onChange={(range) => {
              if (range?.from && range?.to) {
                setDateRange({ from: range.from, to: range.to });
              } else {
                setDateRange(undefined);
              }
            }}
          />
        )}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Subscription">Subscription</SelectItem>
            <SelectItem value="Server Costs">Server Costs</SelectItem>
            {/* Add more categories as needed */}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(transaction.date, "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell
                    className={
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {transaction.type.charAt(0).toUpperCase() +
                      transaction.type.slice(1)}
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell
                    className={
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
