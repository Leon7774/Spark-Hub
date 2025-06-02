"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/card";
import { PlusCircle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface FinancialTransaction {
  id: string;
  date: Date;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
}

type TimeFilter =
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "last30Days"
  | "last90Days";

const incomeCategories = [
  "Salary",
  "Freelance",
  "Subscription Revenue",
  "Product Sales",
  "Consulting",
  "Investment Returns",
  "Rental Income",
  "Bonus",
  "Commission",
  "Other Income",
];

const expenseCategories = [
  "Server Costs",
  "Marketing",
  "Office Supplies",
  "Software Licenses",
  "Professional Services",
  "Travel",
  "Utilities",
  "Insurance",
  "Equipment",
  "Taxes",
  "Bank Fees",
  "Training",
  "Other Expenses",
];

export default function FinancialLog() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    FinancialTransaction[]
  >([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("thisMonth");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: "expense" as "income" | "expense",
    category: "",
    amount: "",
    description: "",
  });

  // Date helper functions
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const startOfDay = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const endOfDay = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  };

  const startOfWeek = (date: Date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = newDate.getDate() - day;
    newDate.setDate(diff);
    return startOfDay(newDate);
  };

  const startOfMonth = (date: Date) => {
    const newDate = new Date(date);
    newDate.setDate(1);
    return startOfDay(newDate);
  };

  const subDays = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - days);
    return newDate;
  };

  // Generate comprehensive dummy data
  useEffect(() => {
    const generateMockData = (): FinancialTransaction[] => {
      const data: FinancialTransaction[] = [];
      const today = new Date();

      // Generate transactions for the last 90 days
      for (let i = 0; i < 150; i++) {
        const daysAgo = Math.floor(Math.random() * 90);
        const transactionDate = subDays(today, daysAgo);

        const isIncome = Math.random() > 0.3; // 70% expenses, 30% income
        const type = isIncome ? "income" : "expense";

        const categories = isIncome ? incomeCategories : expenseCategories;
        const category =
          categories[Math.floor(Math.random() * categories.length)];

        // Generate realistic amounts based on category
        let amount: number;
        if (isIncome) {
          switch (category) {
            case "Salary":
              amount = 3000 + Math.random() * 2000;
              break;
            case "Subscription Revenue":
              amount = 50 + Math.random() * 500;
              break;
            case "Freelance":
              amount = 200 + Math.random() * 1500;
              break;
            case "Investment Returns":
              amount = 100 + Math.random() * 800;
              break;
            default:
              amount = 25 + Math.random() * 750;
          }
        } else {
          switch (category) {
            case "Server Costs":
              amount = 50 + Math.random() * 300;
              break;
            case "Marketing":
              amount = 100 + Math.random() * 1000;
              break;
            case "Software Licenses":
              amount = 20 + Math.random() * 200;
              break;
            case "Professional Services":
              amount = 200 + Math.random() * 800;
              break;
            case "Equipment":
              amount = 100 + Math.random() * 2000;
              break;
            default:
              amount = 10 + Math.random() * 300;
          }
        }

        const descriptions = {
          income: {
            Salary: [
              "Monthly salary payment",
              "Bi-weekly payroll",
              "Salary deposit",
            ],
            Freelance: [
              "Website development project",
              "Logo design work",
              "Consulting session",
              "Content writing",
            ],
            "Subscription Revenue": [
              "Monthly SaaS revenue",
              "Premium subscription",
              "Pro plan upgrade",
            ],
            "Product Sales": [
              "E-commerce sales",
              "Digital product sale",
              "Course purchase",
            ],
            Consulting: [
              "Business consultation",
              "Technical advisory",
              "Strategy session",
            ],
            "Investment Returns": [
              "Stock dividends",
              "Bond interest",
              "Crypto gains",
              "Real estate profits",
            ],
            "Rental Income": ["Monthly rent payment", "Property rental income"],
            Bonus: [
              "Performance bonus",
              "Year-end bonus",
              "Project completion bonus",
            ],
            Commission: [
              "Sales commission",
              "Referral commission",
              "Affiliate earnings",
            ],
            "Other Income": [
              "Miscellaneous income",
              "Gift received",
              "Refund received",
            ],
          },
          expense: {
            "Server Costs": [
              "AWS hosting",
              "DigitalOcean droplet",
              "Cloudflare Pro",
              "Database hosting",
            ],
            Marketing: [
              "Google Ads campaign",
              "Facebook advertising",
              "LinkedIn promotion",
              "Influencer partnership",
            ],
            "Office Supplies": [
              "Printer paper",
              "Desk accessories",
              "Office furniture",
              "Stationery",
            ],
            "Software Licenses": [
              "Adobe Creative Suite",
              "Microsoft Office",
              "Slack Pro",
              "Zoom subscription",
            ],
            "Professional Services": [
              "Legal consultation",
              "Accounting services",
              "Tax preparation",
              "Business advisory",
            ],
            Travel: [
              "Business trip",
              "Conference attendance",
              "Client meeting travel",
              "Hotel accommodation",
            ],
            Utilities: [
              "Internet bill",
              "Phone service",
              "Electricity",
              "Office rent",
            ],
            Insurance: [
              "Business insurance",
              "Health insurance",
              "Equipment insurance",
            ],
            Equipment: [
              "New laptop",
              "Monitor purchase",
              "Office chair",
              "Printer",
            ],
            Taxes: [
              "Quarterly tax payment",
              "Business license fee",
              "Sales tax",
            ],
            "Bank Fees": [
              "Transaction fee",
              "Wire transfer",
              "Monthly service charge",
            ],
            Training: [
              "Online course",
              "Professional certification",
              "Workshop attendance",
            ],
            "Other Expenses": [
              "Miscellaneous expense",
              "Office maintenance",
              "Parking fee",
            ],
          },
        };

        const categoryDescriptions = descriptions[type][category] || [
          "Transaction",
        ];
        const description =
          categoryDescriptions[
            Math.floor(Math.random() * categoryDescriptions.length)
          ];

        data.push({
          id: `txn_${i + 1}`,
          date: transactionDate,
          type,
          category,
          amount: Math.round(amount * 100) / 100,
          description,
        });
      }

      return data.sort((a, b) => b.date.getTime() - a.date.getTime());
    };

    const mockData = generateMockData();
    setTransactions(mockData);
  }, []);

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
    const today = new Date();
    switch (timeFilter) {
      case "today":
        filtered = filtered.filter(
          (t) => t.date >= startOfDay(today) && t.date <= endOfDay(today),
        );
        break;
      case "thisWeek":
        filtered = filtered.filter((t) => t.date >= startOfWeek(today));
        break;
      case "thisMonth":
        filtered = filtered.filter((t) => t.date >= startOfMonth(today));
        break;
      case "last30Days":
        filtered = filtered.filter((t) => t.date >= subDays(today, 30));
        break;
      case "last90Days":
        filtered = filtered.filter((t) => t.date >= subDays(today, 90));
        break;
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, typeFilter, categoryFilter, searchQuery, timeFilter]);

  const handleAddTransaction = () => {
    if (
      !newTransaction.category ||
      !newTransaction.amount ||
      !newTransaction.description
    ) {
      alert("Please fill in all fields");
      return;
    }

    const transaction: FinancialTransaction = {
      id: `txn_${Date.now()}`,
      date: new Date(),
      type: newTransaction.type,
      category: newTransaction.category,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description,
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      type: "expense",
      category: "",
      amount: "",
      description: "",
    });
    setShowAddDialog(false);
  };

  const allCategories = [
    ...new Set([...incomeCategories, ...expenseCategories]),
  ].sort();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Financial Dashboard
        </h1>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Add Transaction
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-green-200 bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-800">Total Income</h3>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-700">
            ${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-green-600 mt-1">
            {filteredTransactions.filter((t) => t.type === "income").length}{" "}
            transactions
          </p>
        </div>

        <div className="border border-red-200 bg-red-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-800">Total Expenses</h3>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700">
            $
            {totalExpenses.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </div>
          <p className="text-xs text-red-600 mt-1">
            {filteredTransactions.filter((t) => t.type === "expense").length}{" "}
            transactions
          </p>
        </div>

        <div
          className={`border-2 rounded-lg p-6 ${netBalance >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3
              className={`text-sm font-medium ${netBalance >= 0 ? "text-green-800" : "text-red-800"}`}
            >
              Net Balance
            </h3>
            <DollarSign
              className={`h-4 w-4 ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}
            />
          </div>
          <div
            className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-700" : "text-red-700"}`}
          >
            $
            {Math.abs(netBalance).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
            {netBalance < 0 && <span className="text-sm ml-1">(deficit)</span>}
          </div>
          <p
            className={`text-xs mt-1 ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {filteredTransactions.length} total transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Today</option>
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="last30Days">Last 30 Days</option>
          <option value="last90Days">Last 90 Days</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="income">Income Only</option>
          <option value="expense">Expenses Only</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {allCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:col-span-2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <span className="text-sm text-gray-500">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.slice(0, 50).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type === "income" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.category}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {transaction.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {transaction.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length > 50 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Showing first 50 transactions. Use filters to narrow down results.
            </p>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Add New Transaction</h2>

            <div className="space-y-4">
              <select
                value={newTransaction.type}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    type: e.target.value as "income" | "expense",
                    category: "",
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <select
                value={newTransaction.category}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    category: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {(newTransaction.type === "income"
                  ? incomeCategories
                  : expenseCategories
                ).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={newTransaction.amount}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    amount: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Description"
                value={newTransaction.description}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    description: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
