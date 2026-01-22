import React, { useState, useEffect } from "react";
import { ArrowLeft, Activity, AlertCircle, CheckCircle } from "lucide-react";
import AuditLogsTable from "./AuditLogsTable";
import AuditLogsActionBar from "./AuditLogsActionBar";
import AuditLogsUploadModal from "./AuditLogsUploadModal";
import AuditLogsEditModal from "./AuditLogsEditModal";
import AuditLogsViewModal from "./AuditLogsViewModal";
import { useAuth } from "../context/AuthContext";
import {
    auditLogsService,
    showSuccessToast,
    showErrorToast,
} from "../api/services";

function AuditLogsPage({ onClose }) {
    const { role } = useAuth();

    // Data states
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [filterAction, setFilterAction] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAuditLog, setSelectedAuditLog] = useState(null);

    // Form states
    const [uploadForm, setUploadForm] = useState({
        action: "",
        target_type: "",
        target_id: "",
    });
    const [editForm, setEditForm] = useState({ action: "", target_type: "" });

    // Role permissions
    const isPrivileged = role === "admin" || role === "auditor";
    const canCreate = role === "admin"; // Only admin can create audit logs
    const canView = isPrivileged;

    // Fetch audit logs from backend with filters
    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            let data;
            if (canView) {
                // Build filter object for backend
                const filters = {};
                if (searchQuery.trim()) {
                    filters.search = searchQuery.trim();
                }
                if (filterAction && filterAction !== "all") {
                    filters.action = filterAction;
                }
                data = await auditLogsService.getAll(filters);
            } else {
                data = [];
            }
            setAuditLogs(data || []);
            setCurrentPage(1); // Reset to first page when filters change
        } catch (error) {
            console.error("Failed to fetch audit logs:", error);
            showErrorToast(error, "Failed to fetch audit logs");
        } finally {
            setLoading(false);
        }
    };

    // Fetch audit logs when role or filters change
    useEffect(() => {
        if (canView) {
            fetchAuditLogs();
        }
    }, [role, searchQuery, filterAction]);

    if (!canView) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                <button
                    onClick={onClose}
                    className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Access Restricted
                    </h2>
                    <p className="text-slate-400">
                        Only Admin and Auditor users can view audit logs.
                    </p>
                </div>
            </div>
        );
    }

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadForm.action) {
            showErrorToast(
                { message: "Please select an action" },
                "Please select an action",
            );
            return;
        }
        if (!uploadForm.target_type) {
            showErrorToast(
                { message: "Please select target type" },
                "Please select target type",
            );
            return;
        }
        if (!uploadForm.target_id) {
            showErrorToast(
                { message: "Please enter target ID" },
                "Please enter target ID",
            );
            return;
        }

        try {
            await auditLogsService.create(
                uploadForm.action,
                uploadForm.target_type,
                uploadForm.target_id,
            );
            showSuccessToast("Audit log created successfully");
            setIsUploadModalOpen(false);
            setUploadForm({
                action: "",
                target_type: "",
                target_id: "",
            });
            fetchAuditLogs();
        } catch (error) {
            console.error("Create audit log error:", error);
            showErrorToast(error, "Failed to create audit log");
        }
    };

    // Note: Backend doesn't have edit/delete for audit logs (immutable)
    // These are kept for UI consistency but won't actually modify data
    const handleEditSubmit = (e) => {
        e.preventDefault();
        showErrorToast(
            { message: "Audit logs are immutable and cannot be edited" },
            "Audit logs are immutable and cannot be edited",
        );
        setIsEditModalOpen(false);
    };

    const handleDelete = (auditLogId) => {
        showErrorToast(
            { message: "Audit logs are immutable and cannot be deleted" },
            "Audit logs are immutable and cannot be deleted",
        );
    };

    const handleView = (auditLog) => {
        setSelectedAuditLog(auditLog);
        setIsViewModalOpen(true);
    };

    const handleEdit = (auditLog) => {
        setSelectedAuditLog(auditLog);
        setEditForm({
            action: auditLog.action,
            target_type: auditLog.target_type,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateClick = () => {
        setUploadForm({
            action: "",
            target_type: "",
            target_id: "",
        });
        setIsUploadModalOpen(true);
    };

    // Calculate stats
    const todayLogs = auditLogs.filter(
        (a) => new Date(a.timestamp) > new Date(Date.now() - 86400000),
    ).length;
    const uniqueAdmins = new Set(auditLogs.map((a) => a.admin_name)).size;

    return (
        <div className="min-h-full p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Audit Logs
                        </h1>
                        <p className="text-slate-400">
                            Track all system activities and changes
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Total Activities
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {loading ? "..." : auditLogs.length}
                                </p>
                            </div>
                            <Activity className="w-12 h-12 text-blue-500/20" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Today's Activities
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {loading ? "..." : todayLogs}
                                </p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500/20" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Admins Active
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {loading ? "..." : uniqueAdmins}
                                </p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-orange-500/20" />
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <AuditLogsActionBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filterAction={filterAction}
                    onFilterActionChange={setFilterAction}
                    onCreateClick={handleCreateClick}
                    userRole={role}
                />

                {/* Audit Logs Table */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">
                            Audit Log Entries
                        </h2>
                    </div>
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">
                            Loading audit logs...
                        </div>
                    ) : (
                        <AuditLogsTable
                            auditLogs={auditLogs}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            userRole={role}
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            <AuditLogsUploadModal
                isOpen={isUploadModalOpen}
                formData={uploadForm}
                onFormChange={setUploadForm}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({
                        action: "",
                        target_type: "",
                        target_id: "",
                    });
                }}
                onSubmit={handleUploadSubmit}
            />

            <AuditLogsEditModal
                isOpen={isEditModalOpen}
                auditLog={selectedAuditLog}
                formData={editForm}
                onFormChange={setEditForm}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditForm({ action: "", target_type: "" });
                    setSelectedAuditLog(null);
                }}
                onSubmit={handleEditSubmit}
            />

            <AuditLogsViewModal
                isOpen={isViewModalOpen}
                auditLog={selectedAuditLog}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedAuditLog(null);
                }}
            />
        </div>
    );
}

export default AuditLogsPage;
