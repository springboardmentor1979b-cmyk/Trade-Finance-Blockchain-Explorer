import React from "react";
import {
    Eye,
    Edit3,
    Trash2,
    Users,
    FileText,
    Activity,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
} from "lucide-react";

// Action type icons mapping
const actionIcons = {
    create: "text-slate-300",
    update: "text-slate-300",
    delete: "text-slate-300",
    verify: "text-slate-300",
    dispute: "text-slate-300",
};

// Status badge styles
const statusStyles = {
    pending: { bg: "bg-transparent", text: "text-slate-300", icon: Clock },
    verified: { bg: "bg-transparent", text: "text-slate-300", icon: CheckCircle },
    disputed: { bg: "bg-transparent", text: "text-slate-300", icon: AlertCircle },
    active: { bg: "bg-transparent", text: "text-slate-300", icon: Activity },
};

/**
 * LedgerTable Component
 * Displays a table of ledger entries with filtering and action buttons
 * Admin and Auditor have same privileges: can view, edit action, and delete
 * Paginated display: 25 entries per page
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.ledgers - Array of ledger objects to display
 * @param {string} props.searchQuery - Current search query
 * @param {string} props.filterAction - Action type filter
 * @param {string} props.startDate - Start date for filtering
 * @param {Function} props.onView - Callback when view button is clicked
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @param {number} props.currentPage - Current page number
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {string} props.userRole - Current user's role (admin, auditor)
 *
 * @example
 * <LedgerTable
 *   ledgers={ledgerData}
 *   searchQuery={query}
 *   filterAction={action}
 *   startDate={startDate}
 *   onView={handleView}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   currentPage={page}
 *   onPageChange={setPage}
 *   userRole="admin"
 * />
 */
function LedgerTable({
    ledgers,
    searchQuery,
    filterAction,
    startDate,
    onView,
    onEdit,
    onDelete,
    currentPage = 1,
    onPageChange,
    userRole = "auditor",
    totalItems,
}) {
    const ITEMS_PER_PAGE = 25;
    const isPrivileged = userRole === "admin" || userRole === "auditor";
    const canEdit = isPrivileged;
    const canDelete = isPrivileged;

    // Filter ledgers
    const filteredLedgers =
        totalItems !== undefined
            ? ledgers
            : ledgers.filter((ledger) => {
                  const matchesSearch =
                      (ledger.document_number || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                      (ledger.user_name || "")
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase());

                  const matchesAction =
                      filterAction === "all" || ledger.action === filterAction;

                  // Filter by date range (startDate to today)
                  const ledgerDate = new Date(ledger.created_at);
                  const filterStartDate = startDate
                      ? new Date(startDate)
                      : null;
                  const todayDate = new Date();
                  todayDate.setHours(23, 59, 59, 999);

                  let matchesDateRange = true;
                  if (filterStartDate) {
                      filterStartDate.setHours(0, 0, 0, 0);
                      matchesDateRange =
                          ledgerDate >= filterStartDate &&
                          ledgerDate <= todayDate;
                  }

                  return matchesSearch && matchesAction && matchesDateRange;
              });

    // Pagination
    const displayedTotalItems =
        totalItems !== undefined ? totalItems : filteredLedgers.length;
    const totalPages = Math.ceil(displayedTotalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedLedgers =
        totalItems !== undefined
            ? ledgers
            : filteredLedgers.slice(startIndex, endIndex);

    // Check if user name column should be shown (hide for bank/corporate)
    const showUserNameColumn = userRole === "admin" || userRole === "auditor";

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Document Number
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Action
                            </th>
                            {showUserNameColumn && (
                                <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                    User Name
                                </th>
                            )}
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Created At
                            </th>
                            <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLedgers.map((ledger) => (
                            <tr
                                key={ledger.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-500/20 p-2 rounded-lg">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">
                                                {ledger.document_number}
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                                ID: {ledger.id}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
                                        {ledger.action}
                                    </span>
                                </td>
                                {showUserNameColumn && (
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                                                <Users className="w-4 h-4 text-slate-300" />
                                            </div>
                                            <span className="text-slate-300">
                                                {ledger.user_name}
                                            </span>
                                        </div>
                                    </td>
                                )}
                                <td className="py-4 px-6 text-slate-300">
                                    {new Date(
                                        ledger.created_at
                                    ).toLocaleDateString()}{" "}
                                    {new Date(
                                        ledger.created_at
                                    ).toLocaleTimeString()}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onView(ledger)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                                        </button>
                                        {canEdit && (
                                            <button
                                                onClick={() => onEdit(ledger)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                title="Edit"
                                            >
                                                <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-yellow-400" />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() =>
                                                    onDelete(ledger.id)
                                                }
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

                {filteredLedgers.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">
                            No ledger entries found
                        </p>
                        <p className="text-slate-500 text-sm mt-1">
                            Try adjusting your search or filters
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/10">
                    <p className="text-sm text-slate-400">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(endIndex, filteredLedgers.length)} of{" "}
                        {filteredLedgers.length} entries | Page {currentPage} of{" "}
                        {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
                        >
                            Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex gap-1">
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        currentPage === page
                                            ? "bg-blue-600 text-white"
                                            : "bg-white/10 hover:bg-white/20 text-white"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LedgerTable;
