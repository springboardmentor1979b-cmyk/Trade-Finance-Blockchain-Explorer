import React from "react";
import { Eye, Edit3, Trash2, FileText } from "lucide-react";

function RiskScoresTable({
    riskScores,
    onView,
    onEdit,
    onDelete,
    currentPage = 1,
    onPageChange,
    userRole = "admin",
}) {
    const ITEMS_PER_PAGE = 25;
    const isPrivileged = userRole === "auditor" || userRole === "admin";
    const canEdit = isPrivileged;
    const canDelete = isPrivileged;

    // Data is already filtered by backend, just paginate
    const totalPages = Math.ceil(riskScores.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedRiskScores = riskScores.slice(startIndex, endIndex);

    const getRiskLevel = (score) => {
        if (score > 70)
            return { text: "High", color: "bg-red-500/20 text-red-400" };
        if (score > 40)
            return {
                text: "Medium",
                color: "bg-yellow-500/20 text-yellow-400",
            };
        return { text: "Low", color: "bg-green-500/20 text-green-400" };
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Risk ID
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                User
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Score
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Rationale
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Updated At
                            </th>
                            <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRiskScores.map((riskScore) => {
                            const riskLevel = getRiskLevel(riskScore.score);
                            return (
                                <tr
                                    key={riskScore.id}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                                <FileText className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <span className="text-white font-medium">
                                                RISK-
                                                {String(riskScore.id).padStart(
                                                    3,
                                                    "0",
                                                )}
                                                -2024
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-slate-300">
                                        {riskScore.user_name}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${riskLevel.color}`}
                                        >
                                            {riskScore.score}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-300 max-w-xs truncate">
                                        {riskScore.rationale || "-"}
                                    </td>
                                    <td className="py-4 px-6 text-slate-300">
                                        {new Date(
                                            riskScore.last_updated,
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    onView(riskScore)
                                                }
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                                            </button>
                                            {canEdit && (
                                                <button
                                                    onClick={() =>
                                                        onEdit(riskScore)
                                                    }
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-yellow-400" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() =>
                                                        onDelete(riskScore.id)
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
                            );
                        })}
                    </tbody>
                </table>

                {riskScores.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">No risk scores found</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/10">
                    <p className="text-sm text-slate-400">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(endIndex, riskScores.length)} of{" "}
                        {riskScores.length} entries | Page {currentPage} of{" "}
                        {totalPages}
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

export default RiskScoresTable;
