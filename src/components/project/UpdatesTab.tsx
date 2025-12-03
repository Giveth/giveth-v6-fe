export function UpdatesTab() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="rounded-2xl border border-gray-100 bg-white p-6"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-[#fd67ac] uppercase tracking-wider">
              Update #{4 - i}
            </span>
            <span className="text-xs text-gray-500">March {15 - i}, 2025</span>
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900">
            Progress on the Community Center
          </h3>
          <p className="text-sm text-gray-600">
            We are excited to share that the foundation for the new community
            center has been laid! Thanks to your generous donations, we were
            able to purchase all the necessary materials and hire local
            builders.
          </p>
        </div>
      ))}
    </div>
  )
}
