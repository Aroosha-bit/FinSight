import {
  ArrowDownWideNarrow,
  CirclePlus,
  ListFilter,
  ListFilterPlus,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import AddExpense from "./AddExpense";
import Filter from "../components/Filter";
import SortModal from "../components/SortModal"
const API = "http://localhost:5000/api/expense";

const AMOUNT_RANGES = {
  "₹0 - ₹499": { min: 0, max: 499 },
  "₹500 - ₹999": { min: 500, max: 999 },
  "₹1000 - ₹1999": { min: 1000, max: 1999 },
  "₹2000+": { min: 2000, max: Infinity },
};

const DEFAULT_FILTERS = {
  dateRange: "",
  customDate: "",
  categories: [],
  amountRanges: [],
  paymentMethods: [],
};

const ExpenseList = ({ onExpenseChange }) => {
  const [txns, setTxns] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState("Rs.");

  useEffect(() => {
    const storedCurrency = localStorage.getItem("loggedInCurrency") || "PKR (Rs)";
    if (storedCurrency.includes("Rs")) setCurrencySymbol("Rs. ");
    else if (storedCurrency.includes("$")) setCurrencySymbol("$");
    else if (storedCurrency.includes("€")) setCurrencySymbol("€");
    else if (storedCurrency.includes("₹")) setCurrencySymbol("₹");
  }, []);
  const [editRow, setEditRow] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("newest");
  const [appliedSort, setAppliedSort] = useState("newest");

  const filterRef = useRef(null);
  const sortRef = useRef(null);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/allExpense`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      setTxns(data);
      if (onExpenseChange) {
        onExpenseChange(data);
      }
    } catch (err) {
      console.log("Fetch error:", err.message);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/deleteExpense/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const updated = txns.filter((t) => t._id !== id);
      setTxns(updated);
      if (onExpenseChange) {
        onExpenseChange(updated);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleEdit = (expense) => {
    setEditRow(expense);
    setShowAdd(true);
  };

  const handleApplyFilter = () => {
    setAppliedFilters(filters);
    setShowFilter(false);
  };

  const handleCancelFilter = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setShowFilter(false);
  };

  const handleApplySort = () => {
    setAppliedSort(sortBy);
    setShowSort(false);
  };

  const isWithinDateRange = (dateStr, range) => {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case "Today":
        return date >= startOfToday;
      case "This Week": {
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
        return date >= startOfWeek;
      }
      case "This Month":
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case "Previous Month": {
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
      }
      default:
        return true;
    }
  };

  // Apply search -> filters -> sort, in that order
  const visibleTxns = txns
    .filter((tx) => {
      if (searchTerm && !tx.notes?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .filter((tx) => {
      const { dateRange, customDate, categories, amountRanges, paymentMethods } = appliedFilters;

      if (customDate) {
        const txDate = new Date(tx.date).toDateString();
        const selected = new Date(customDate).toDateString();
        if (txDate !== selected) return false;
      } else if (dateRange && !isWithinDateRange(tx.date, dateRange)) {
        return false;
      }

      if (categories.length > 0 && !categories.includes(tx.category)) {
        return false;
      }

      if (amountRanges.length > 0) {
        const matchesAmount = amountRanges.some((label) => {
          const range = AMOUNT_RANGES[label];
          return tx.amount >= range.min && tx.amount <= range.max;
        });
        if (!matchesAmount) return false;
      }

      if (paymentMethods.length > 0 && !paymentMethods.includes(tx.paymentMethod)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (appliedSort) {
        case "oldest":
          return new Date(a.date) - new Date(b.date);
        case "price_high":
          return b.amount - a.amount;
        case "price_low":
          return a.amount - b.amount;
        case "newest":
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-800">Expense List</h2>

        <button
          onClick={() => setShowAdd(true)}
          className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
        >
          <CirclePlus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center border-2 border-[#6B7280] rounded-full px-2 py-1 gap-2">
          <Search className="w-5 h-5 stroke-[#6B7280]" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => {
                setShowFilter((prev) => !prev);
                setShowSort(false);
              }}
              className="flex cursor-pointer items-center text-[#6B7280] bg-[#E5E7EB] rounded-full px-4 py-1 gap-1"
            >
              <ListFilterPlus className="w-5 h-5"/>
              Filter
            </button>
            {showFilter && (
              <Filter
                filters={filters}
                setFilters={setFilters}
                onApply={handleApplyFilter}
                onCancel={handleCancelFilter}
              />
            )}
          </div>

          <div className="relative" ref={sortRef}>
            <button
              onClick={() => {
                setShowSort((prev) => !prev);
                setShowFilter(false);
              }}
              className="flex cursor-pointer items-center text-[#6B7280] bg-[#E5E7EB] rounded-full px-4 py-1 gap-1"
            >
              <ArrowDownWideNarrow />
              Sort
            </button>
            {showSort && (
              <SortModal sortBy={sortBy} setSortBy={setSortBy} onApply={handleApplySort} />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["DATE", "AMOUNT", "CATEGORY", "NOTES", "ACTIONS"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold text-blue-600 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visibleTxns.map((tx) => (
                <tr key={tx._id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-800">
                    {currencySymbol}{tx.amount}
                  </td>

                  <td className="px-4 py-3 text-gray-600">{tx.category}</td>

                  <td className="px-4 py-3 text-gray-500">{tx.notes}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="p-2 cursor-pointer bg-gray-100 rounded-lg hover:bg-blue-100"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(tx._id)}
                        className="p-2 bg-red-50 cursor-pointer rounded-lg hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visibleTxns.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <AddExpense
          onClose={() => {
            setShowAdd(false);
            setEditRow(null);
          }}
          onAdd={fetchExpenses}
          editData={editRow}
        />
      )}
    </div>
  );
};

export default ExpenseList;