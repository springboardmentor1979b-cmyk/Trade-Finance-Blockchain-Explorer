import React from "react";
import { Eye, Edit3, Trash2, FileText } from "lucide-react";

function TradeTransactionsTable({
    transactions,
    searchQuery,
    filterStatus,
    filterBuyer,
    onView,
    onEdit,
    onDelete,
    currentPage = 1,
    onPageChange,
    userRole = "admin",
}) {
    const ITEMS_PER_PAGE = 25;
    const isPrivileged = userRole === "admin";
    const canEdit = isPrivileged;
    const canDelete = isPrivileged;

    // Filter transactions
    const filteredTransactions = transactions.filter((t) => {
        const matchesSearch =
            (t.buyer_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.seller_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.amount || "").includes(searchQuery);

        const matchesStatus = filterStatus === "all" || t.status === filterStatus;

        const matchesBuyer = filterBuyer === "all" || t.buyer_name === filterBuyer;

        return matchesSearch && matchesStatus && matchesBuyer;
    });

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-800",
        in_progress: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        disputed: "bg-red-100 text-red-800",
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Buyer
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Seller
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Amount
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Status
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Created At
                            </th>
                            <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTransactions.map((transaction) => (
                            <tr
                                key={transaction.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-500/20 p-2 rounded-lg">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <span className="text-white font-medium">
                                            {transaction.buyer_name}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-slate-300">
                                    {transaction.seller_name}
                                </td>
                                <td className="py-4 px-6 text-slate-300">
                                    {transaction.amount} {transaction.currency}
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400`}>
                                        {transaction.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-slate-300">
                                    {new Date(transaction.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onView(transaction)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                                        </button>
                                        {canEdit && (
                                            <button
                                                onClick={() => onEdit(transaction)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                title="Edit"
                                            >
                                                <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-yellow-400" />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() => onDelete(transaction.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">No trade transactions found</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/10">
                    <p className="text-sm text-slate-400">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of{" "}
                        {filteredTransactions.length} entries | Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TradeTransactionsTable;
