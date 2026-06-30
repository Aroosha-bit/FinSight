import { Calendar } from "lucide-react";

const CATEGORIES = ["Groceries", "Dining", "Transport", "Rent"];
const AMOUNT_RANGES = [
  { label: "Rs 0 - Rs 499", min: 0, max: 499 },
  { label: "Rs 500 - Rs 999", min: 500, max: 999 },
  { label: "Rs 1000 - Rs 1999", min: 1000, max: 1999 },
  { label: "Rs 2000+", min: 2000, max: Infinity },
];
const PAYMENT_METHODS = ["Cards", "Cash", "UPI", "Pay later"];
const DATE_RANGES = ["Today", "This Week", "This Month", "Previous Month"];

export default function FilterModal({ filters, setFilters, onApply, onCancel }) {
  const toggleArrayValue = (key, value) => {
    setFilters((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const setDateRange = (value) => {
    setFilters((prev) => ({ ...prev, dateRange: value, customDate: "" }));
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-[420px] bg-blue-50 shadow-2xl rounded-2xl  border border-gray-100 z-50 p-6">
      {/* Date range */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Date range</h3>
        <div className="flex items-center gap-6 flex-wrap mb-3">
          {DATE_RANGES.map((label) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dateRange"
                checked={filters.dateRange === label}
                onChange={() => setDateRange(label)}
                className="w-5 h-5 accent-blue-600"
              />
              <span className="text-gray-600 font-medium">{label}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 font-medium">Custom Date</span>
          <div className="flex items-center gap-2 border border-gray-400 rounded-lg px-3 py-2 flex-1">
            <input
              type="date"
              value={filters.customDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, customDate: e.target.value, dateRange: "" }))
              }
              className="outline-none text-gray-600 w-full bg-transparent"
            />
            
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Category</h3>
        <div className="flex items-center gap-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleArrayValue("categories", cat)}
                className="w-5 h-5 rounded accent-blue-600"
              />
              <span className="text-gray-600 font-medium">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amount range */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Amount range</h3>
        <div className="flex items-center gap-5 flex-wrap">
          {AMOUNT_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.amountRanges.includes(range.label)}
                onChange={() => toggleArrayValue("amountRanges", range.label)}
                className="w-5 h-5 rounded accent-blue-600"
              />
              <span className="text-gray-600 font-medium">{range.label}</span>
            </label>
          ))}
        </div>
      </div>


      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onApply}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
        >
          APPLY
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}