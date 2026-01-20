import React from "react";
import { Plus, Search, ChevronDown } from "lucide-react";

function AuditLogsActionBar({
    searchQuery,
    onSearchChange,
    filterAction,
    onFilterActionChange,
    onCreateClick,
    userRole = "admin",
}) {
    const canCreate = userRole === "auditor";
    const actions = ["CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "IMPORT"];
    const uniqueActions = [...new Set(actions)].sort();

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 border border-white/10">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Admin, Action, or Target..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Action Filter */}
                    <div className="relative">
                        <select
                            value={filterAction}
                            onChange={(e) => onFilterActionChange(e.target.value)}
                            className="appearance-none bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="all" className="bg-slate-800">
                                All Actions
                            </option>
                            {uniqueActions.map((action) => (
                                <option key={action} value={action} className="bg-slate-800">
                                    {action}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    </div>

                    {/* Create Button */}
                    {canCreate && (
                        <button
                            onClick={onCreateClick}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Log Entry
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AuditLogsActionBar;
