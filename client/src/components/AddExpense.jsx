// components/AddExpenseModal.jsx
import {
  BanknoteArrowDown,
  Calendar,
  CirclePlus,
  CircleX,
  HandCoins,
  Pencil,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { handleError } from "../utils";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Healthcare",
  "Education",
  "Entertainment",
  "Travel",
  "Other",
];
const emptyForm = {
  amount: "",
  category: "",
  date: "",
  notes: "",
  image: null,
  imagePreview: null,
};

export default function AddExpense({ onClose, onAdd, editData }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const validate = () => {
    const e = {};
    if (!form.amount) e.amount = "Enter a valid amount";
    if (!form.category) e.category = "Select a category";
    if (!form.date) e.date = "Select a date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const token = localStorage.getItem("token");

      const isEdit = !!editData;

      const url = isEdit
        ? `http://localhost:5000/api/expense/updateExpense/${editData._id}`
        : "http://localhost:5000/api/expense/create-expense";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(form.amount),
          category: form.category,
          date: form.date,
          notes: form.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return handleError(result.message || "Request failed");
      }

      onAdd(result.expense || result); // refresh list
      setForm(emptyForm);
      onClose();
    } catch (error) {
      handleError(error.message);
    }
  };
  useEffect(() => {
    if (editData) {
      setForm({
        amount: editData.amount || "",
        category: editData.category || "",
        date: editData.date ? editData.date.split("T")[0] : "",
        notes: editData.notes || "",
        image: null,
        imagePreview: null,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editData]);
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.22s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        <div className="flex flex-col items-center pt-8 pb-2">
          <div className="w-16 h-16 rounded-2xl border-2 border-blue-200 bg-blue-50 flex items-center justify-center mb-3">
            <BanknoteArrowDown />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            {editData ? "Update Expense" : "Add Expense"}
          </h2>
        </div>

        <form onSubmit={handleAddExpense} className="px-6 pb-6 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Amount
            </label>
            <div
              className={`flex items-center border rounded-xl px-3 py-3 gap-2 bg-white transition-colors
              ${errors.amount ? "border-red-400" : "border-gray-200 focus-within:border-blue-400"}`}
            >
              <HandCoins className="stroke-[#6B7280]" />
              <input
                type="number"
                placeholder="Enter Amount"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                className="flex-1 outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Category
            </label>
            <div
              className={`flex items-center border rounded-xl px-3 py-3 gap-2 bg-white transition-colors
              ${errors.category ? "border-red-400" : "border-gray-200 focus-within:border-blue-400"}`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect
                  x="2"
                  y="2"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                />
                <rect
                  x="11"
                  y="2"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                />
                <rect
                  x="2"
                  y="11"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                />
                <rect
                  x="11"
                  y="11"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                />
              </svg>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="flex-1 outline-none text-gray-700 text-sm bg-transparent appearance-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6l4 4 4-4"
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Date
            </label>
            <div
              className={`flex items-center border rounded-xl px-3 py-3 gap-2 bg-white transition-colors
              ${errors.date ? "border-red-400" : "border-gray-200 focus-within:border-blue-400"}`}
            >
              <Calendar className="stroke-[#6B7280]" />
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="flex-1 outline-none text-gray-700 text-sm bg-transparent cursor-pointer"
              />
            </div>
            {errors.date && (
              <p className="text-xs text-red-500 mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Notes{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Write something..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 resize-none transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm transition-all"
            >
              {editData ? (
                <>
                  <Pencil />
                  UPDATE
                </>
              ) : (
                <>
                  <CirclePlus />
                  ADD
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex cursor-pointer items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-sm transition-all"
            >
              <CircleX />
              CANCEL
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}
