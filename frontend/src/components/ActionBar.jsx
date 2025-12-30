import React from "react";
import { Plus, Search, ChevronDown } from "lucide-react";

/**
 * ActionBar Component
 * Handles document search, filtering by type and status, and upload button
 * Supports role-based rendering:
 * - Admin: Can see upload button
 * - Corporate/Bank: Cannot upload new documents
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.searchQuery - Current search query text
 * @param {Function} props.onSearchChange - Callback when search text changes
 * @param {string} props.filterType - Currently selected document type filter
 * @param {Function} props.onFilterTypeChange - Callback when type filter changes
 * @param {string} props.filterStatus - Currently selected status filter
 * @param {Function} props.onFilterStatusChange - Callback when status filter changes
 * @param {Function} props.onUploadClick - Callback when Upload button is clicked
 * @param {string} props.userRole - Current user's role (admin, corporate, bank)
 *
 * @example
 * <ActionBar
 *   searchQuery={query}
 *   onSearchChange={setQuery}
 *   filterType={type}
 *   onFilterTypeChange={setType}
 *   filterStatus={status}
 *   onFilterStatusChange={setStatus}
 *   onUploadClick={() => setShowModal(true)}
 *   userRole="admin"
 * />
 */
function ActionBar({
    searchQuery,
    onSearchChange,
    filterType,
    onFilterTypeChange,
    filterStatus,
    onFilterStatusChange,
    onUploadClick,
    userRole = "corporate",
}) {
    // Banks and corporates can upload documents, not admin
    const canUpload = userRole === "bank" || userRole === "corporate";
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/10">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Type Filter */}
                    <div className="relative">
                        <select
                            value={filterType}
                            onChange={(e) => onFilterTypeChange(e.target.value)}
                            className="appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="all" className="bg-slate-800">
                                All Types
                            </option>
                            <option value="loc" className="bg-slate-800">
                                Letter of Credit
                            </option>
                            <option value="invoice" className="bg-slate-800">
                                Invoice
                            </option>
                            <option
                                value="bill_of_lading"
                                className="bg-slate-800"
                            >
                                Bill of Lading
                            </option>
                            <option value="po" className="bg-slate-800">
                                Purchase Order
                            </option>
                            <option value="coo" className="bg-slate-800">
                                Certificate of Origin
                            </option>
                            <option
                                value="insurance_cert"
                                className="bg-slate-800"
                            >
                                Insurance Certificate
                            </option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) =>
                                onFilterStatusChange(e.target.value)
                            }
                            className="appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="all" className="bg-slate-800">
                                All Status
                            </option>
                            <option value="pending" className="bg-slate-800">
                                Pending
                            </option>
                            <option
                                value="in_progress"
                                className="bg-slate-800"
                            >
                                In Progress
                            </option>
                            <option value="verified" className="bg-slate-800">
                                Verified
                            </option>
                            <option value="completed" className="bg-slate-800">
                                Completed
                            </option>
                            <option value="disputed" className="bg-slate-800">
                                Disputed
                            </option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>

                    {/* Upload Button - Admin Only */}
                    {canUpload && (
                        <button
                            onClick={onUploadClick}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Upload Document
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ActionBar;
