
export function QFStats() {
    return (
        <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex flex-1 gap-8 sm:gap-12">
                <div>
                    <p className="text-sm font-medium text-gray-500">Matching Pool</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">$150,000</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Donations</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">$190,854</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500"># of Donations</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">72</p>
                </div>
            </div>

            <div className="text-right">
                <p className="text-lg font-bold text-gray-900">March 18 - April 1, 2025</p>
            </div>
        </div>
    );
}
