import React from "react";
import { Plus, Search, ChevronDown } from "lucide-react";

function TradeTransactionsActionBar({
    searchQuery,
    onSearchChange,
    filterStatus,
    onFilterStatusChange,
    filterBuyer,
    onFilterBuyerChange,
    onCreateClick,
    userRole = "admin",
    users = [], // Accept users from parent
}) {
    const canCreate = userRole === "bank" || userRole === "corporate";
    const showBuyerFilter = userRole === "admin" || userRole === "auditor";

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/10">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by transaction ID, buyer, or seller..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
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
                            <option value="completed" className="bg-slate-800">
                                Completed
                            </option>
                            <option value="disputed" className="bg-slate-800">
                                Disputed
                            </option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>

                    {/* Buyer Filter - Only for Admin/Auditor */}
                    {showBuyerFilter && users.length > 0 && (
                        <div className="relative">
                            <select
                                value={filterBuyer}
                                onChange={(e) =>
                                    onFilterBuyerChange(e.target.value)
                                }
                                className="appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="all" className="bg-slate-800">
                                    All Buyers
                                </option>
                                {users.map((user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                        className="bg-slate-800"
                                    >
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        </div>
                    )}

                    {/* Create Button */}
                    {canCreate && (
                        <button
                            onClick={onCreateClick}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Trade
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TradeTransactionsActionBar;
