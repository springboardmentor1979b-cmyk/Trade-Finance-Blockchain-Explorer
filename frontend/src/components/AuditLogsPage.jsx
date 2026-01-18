import React, { useState } from "react";
import {
    ArrowLeft,
    Activity,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import AuditLogsTable from "./AuditLogsTable";
import AuditLogsActionBar from "./AuditLogsActionBar";
import AuditLogsUploadModal from "./AuditLogsUploadModal";
import AuditLogsEditModal from "./AuditLogsEditModal";
import AuditLogsViewModal from "./AuditLogsViewModal";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

function AuditLogsPage({ onClose }) {
    const { role } = useAuth();

    // Generate 50 sample audit logs
    const generateSampleAuditLogs = () => {
        const admins = ["Admin User", "John Smith", "Jane Doe"];
        const actions = ["CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "IMPORT"];
        const targets = ["Document", "Ledger", "Transaction", "User", "Risk Score"];

        return Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            admin_id: (i % 3) + 1,
            admin_name: admins[i % admins.length],
            action: actions[i % actions.length],
            target_type: targets[i % targets.length],
            target_id: Math.floor(Math.random() * 1000) + 1,
            description: `${actions[i % actions.length]} operation on ${targets[i % targets.length]}`,
            timestamp: new Date(
                Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
            ).toISOString(),
        }));
    };

    const [auditLogs, setAuditLogs] = useState(generateSampleAuditLogs());
    const [searchQuery, setSearchQuery] = useState("");
    const [filterAction, setFilterAction] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAuditLog, setSelectedAuditLog] = useState(null);

    const [uploadForm, setUploadForm] = useState({
        admin_name: "",
        action: "",
        target_type: "",
        target_id: "",
    });
    const [editForm, setEditForm] = useState({ action: "", target_type: "" });

    const canCreate = role === "auditor";
    const canEdit = role === "auditor";
    const canDelete = role === "auditor";
    const canView = role === "auditor" || role === "bank" || role === "corporate";

    // For bank and corporate users, they see all audit logs (they don't filter by admin)
    // But we could add logic here if needed
    const getVisibleAuditLogs = () => {
        return auditLogs;
    };

    if (!canView) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
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
                        Only Auditor, Bank, and Corporate users can view audit logs.
                    </p>
                </div>
            </div>
        );
    }

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!uploadForm.admin_name) {
            toast.error("Please select an admin");
            return;
        }
        if (!uploadForm.action) {
            toast.error("Please select an action");
            return;
        }
        if (!uploadForm.target_type) {
            toast.error("Please select target type");
            return;
        }

        const newAuditLog = {
            id: auditLogs.length + 1,
            admin_id: Math.random() * 10,
            admin_name: uploadForm.admin_name,
            action: uploadForm.action,
            target_type: uploadForm.target_type,
            target_id: uploadForm.target_id || Math.floor(Math.random() * 1000),
            description: `${uploadForm.action} operation on ${uploadForm.target_type}`,
            timestamp: new Date().toISOString(),
        };

        setAuditLogs([newAuditLog, ...auditLogs]);
        toast.success("Audit log created successfully");
        setIsUploadModalOpen(false);
        setUploadForm({ admin_name: "", action: "", target_type: "", target_id: "" });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedAuditLog) return;

        if (!editForm.action) {
            toast.error("Please select an action");
            return;
        }

        const updatedAuditLogs = auditLogs.map((a) =>
            a.id === selectedAuditLog.id
                ? {
                    ...a,
                    action: editForm.action,
                    target_type: editForm.target_type,
                }
                : a
        );

        setAuditLogs(updatedAuditLogs);
        toast.success("Audit log updated successfully");
        setIsEditModalOpen(false);
        setEditForm({ action: "", target_type: "" });
        setSelectedAuditLog(null);
    };

    const handleDelete = (auditLogId) => {
        if (window.confirm("Are you sure you want to delete this audit log?")) {
            setAuditLogs(auditLogs.filter((a) => a.id !== auditLogId));
            toast.success("Audit log deleted successfully");
        }
    };

    const handleView = (auditLog) => {
        setSelectedAuditLog(auditLog);
        setIsViewModalOpen(true);
    };

    const handleEdit = (auditLog) => {
        setSelectedAuditLog(auditLog);
        setEditForm({ action: auditLog.action, target_type: auditLog.target_type });
        setIsEditModalOpen(true);
    };

    const handleCreateClick = () => {
        setUploadForm({ admin_name: "", action: "", target_type: "", target_id: "" });
        setIsUploadModalOpen(true);
    };

    const visibleAuditLogs = getVisibleAuditLogs();

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
                                    {visibleAuditLogs.length}
                                </p>
                            </div>
                            <Activity className="w-12 h-12 text-blue-500/20 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Today's Activities
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {visibleAuditLogs.filter((a) =>
                                        new Date(a.timestamp) > new Date(Date.now() - 86400000)
                                    ).length}
                                </p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500/20 text-green-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Admins Active
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {new Set(visibleAuditLogs.map((a) => a.admin_name)).size}
                                </p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-orange-500/20 text-orange-400" />
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
                    <AuditLogsTable
                        auditLogs={visibleAuditLogs}
                        searchQuery={searchQuery}
                        filterAction={filterAction}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        userRole={role}
                    />
                </div>
            </div>

            {/* Modals */}
            <AuditLogsUploadModal
                isOpen={isUploadModalOpen}
                formData={uploadForm}
                onFormChange={setUploadForm}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({ admin_name: "", action: "", target_type: "", target_id: "" });
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
