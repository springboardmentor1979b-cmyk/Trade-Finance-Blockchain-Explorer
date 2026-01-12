import React from "react";
import { Plus, Search, ChevronDown } from "lucide-react";

/**
 * LedgerActionBar Component
 * Handles ledger search, filtering by action and date range, and upload button
 * Bank and Corporate users can create new ledgers
 * Admin and Auditor cannot create new ledgers but can edit/delete
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.searchQuery - Current search query text
 * @param {Function} props.onSearchChange - Callback when search text changes
 * @param {string} props.filterAction - Currently selected action filter
 * @param {Function} props.onFilterActionChange - Callback when action filter changes
 * @param {string} props.startDate - Start date for filtering
 * @param {Function} props.onStartDateChange - Callback when start date changes
 * @param {Function} props.onCreateClick - Callback when Create button is clicked
 * @param {string} props.userRole - Current user's role (admin, bank, auditor, corporate)
 *
 * @example
 * <LedgerActionBar
 *   searchQuery={query}
 *   onSearchChange={setQuery}
 *   filterAction={action}
 *   onFilterActionChange={setAction}
 *   startDate={startDate}
 *   onStartDateChange={setStartDate}
 *   onCreateClick={() => setShowModal(true)}
 *   userRole="bank"
 * />
 */
function LedgerActionBar({
    searchQuery,
    onSearchChange,
    filterAction,
    onFilterActionChange,
    startDate,
    onStartDateChange,
    onCreateClick,
    userRole = "auditor",
}) {
    // Bank and Corporate can create new ledgers
    const canCreate = userRole === "bank" || userRole === "corporate";

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/10">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by document number or user..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Action Filter */}
                    <div className="relative">
                        <select
                            value={filterAction}
                            onChange={(e) =>
                                onFilterActionChange(e.target.value)
                            }
                            className="appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="all" className="bg-slate-800">
                                All Actions
                            </option>
                            <option value="issued" className="bg-slate-800">
                                Issued
                            </option>
                            <option value="amended" className="bg-slate-800">
                                Amended
                            </option>
                            <option value="shipped" className="bg-slate-800">
                                Shipped
                            </option>
                            <option value="received" className="bg-slate-800">
                                Received
                            </option>
                            <option value="paid" className="bg-slate-800">
                                Paid
                            </option>
                            <option value="cancelled" className="bg-slate-800">
                                Cancelled
                            </option>
                            <option value="verified" className="bg-slate-800">
                                Verified
                            </option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>

                    {/* Date Range Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-300">
                            From:
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm text-slate-400">
                            to Today
                        </span>
                    </div>

                    {/* Create Ledger Button - Bank Only */}
                    {canCreate && (
                        <button
                            onClick={onCreateClick}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Ledger
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LedgerActionBar;
