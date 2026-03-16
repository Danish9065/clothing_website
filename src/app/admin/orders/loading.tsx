export default function AdminOrdersLoading() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="w-32 h-8 bg-slate-200 rounded animate-pulse mb-2"></div>
                    <div className="w-64 h-4 bg-slate-200 rounded animate-pulse"></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
                    <div className="w-32 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
                    <div className="w-32 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-y border-slate-100">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl">Order ID</th>
                                <th className="px-6 py-4">Business</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Date (IST)</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right rounded-tr-xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-4 bg-slate-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-32 h-4 bg-slate-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-4 bg-slate-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-24 h-4 bg-slate-200 rounded animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-20 h-6 bg-slate-200 rounded-md animate-pulse"></div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="w-12 h-6 bg-slate-200 rounded animate-pulse ml-auto"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
