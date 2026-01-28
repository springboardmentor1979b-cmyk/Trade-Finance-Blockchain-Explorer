import React from "react";
import { Eye, Edit3, Trash2, FileText } from "lucide-react";

function AuditLogsTable({
    auditLogs,
    onView,
    onEdit,
    onDelete,
    currentPage = 1,
    onPageChange,
    userRole = "admin",
}) {
    const ITEMS_PER_PAGE = 25;
    const isPrivileged = userRole === "auditor" || userRole === "admin";
    // Note: Audit logs are immutable - edit/delete buttons kept for UI consistency but won't work
    const canEdit = false; // Audit logs cannot be edited
    const canDelete = false; // Audit logs cannot be deleted

    // Data is already filtered by backend, just paginate
    const totalPages = Math.ceil(auditLogs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedAuditLogs = auditLogs.slice(startIndex, endIndex);

    const actionColors = {
        CREATE: "text-slate-300",
        UPDATE: "text-slate-300",
        DELETE: "text-slate-300",
        VIEW: "text-slate-300",
        EXPORT: "text-slate-300",
        IMPORT: "text-slate-300",
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Log ID
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Admin
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Action
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Target Type
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Timestamp
                            </th>
                            <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAuditLogs.map((auditLog) => (
                            <tr
                                key={auditLog.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-500/20 p-2 rounded-lg">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <span className="text-white font-medium">
                                            LOG-
                                            {String(auditLog.id).padStart(
                                                3,
                                                "0",
                                            )}
                                            -
                                            {new Date(
                                                auditLog.timestamp,
                                            ).getFullYear()}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-slate-300">
                                    {auditLog.admin_name}
                                </td>
                                <td className="py-4 px-6">
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${actionColors[auditLog.action] || "bg-slate-500/20 text-slate-400"}`}
                                    >
                                        {auditLog.action}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-slate-300">
                                    {auditLog.target_type}
                                </td>
                                <td className="py-4 px-6 text-slate-300">
                                    {new Date(
                                        auditLog.timestamp,
                                    ).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onView(auditLog)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                            title="View"
                                        >
                                            <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                                        </button>
                                        {canEdit && (
                                            <button
                                                onClick={() => onEdit(auditLog)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                title="Edit"
                                            >
                                                <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-yellow-400" />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() =>
                                                    onDelete(auditLog.id)
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

                {auditLogs.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">No audit logs found</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/10">
                    <p className="text-sm text-slate-400">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(endIndex, auditLogs.length)} of{" "}
                        {auditLogs.length} entries | Page {currentPage} of{" "}
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

export default AuditLogsTable;
