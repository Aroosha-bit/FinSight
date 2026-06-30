const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price: High to Low", value: "price_high" },
  { label: "Price: Low to High", value: "price_low" },
];

export default function SortModal({ sortBy, setSortBy, onApply }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-[300px] bg-blue-50 rounded-2xl shadow-2xl border border-gray-100 z-50 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Sort</h3>

      <div className="flex flex-col gap-4 mb-5">
        {SORT_OPTIONS.map((opt) => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="sortBy"
              checked={sortBy === opt.value}
              onChange={() => setSortBy(opt.value)}
              className="w-5 h-5 accent-blue-600"
            />
            <span className="text-gray-600 font-medium">{opt.label}</span>
          </label>
        ))}
      </div>

      <button
        onClick={onApply}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
      >
        APPLY
      </button>
    </div>
  );
}