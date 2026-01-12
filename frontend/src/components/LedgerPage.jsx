import React, { useState } from "react";
import {
    FileText,
    AlertCircle,
    CheckCircle,
    ArrowLeft,
    BookOpen,
} from "lucide-react";
import LedgerTable from "./LedgerTable";
import LedgerActionBar from "./LedgerActionBar";
import LedgerUploadModal from "./LedgerUploadModal";
import LedgerEditModal from "./LedgerEditModal";
import LedgerViewModal from "./LedgerViewModal";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

/**
 * LedgerPage Component
 * Displays paginated list of ledger entries
 * Admin and Auditor can view complete list, edit action, and delete
 * Bank and Corporate can create new ledgers
 */
function LedgerPage({ onClose }) {
    const { role } = useAuth();

    // Check privileges
    const isPrivileged = role === "admin" || role === "auditor";
    const canCreate = role === "bank" || role === "corporate";

    // Mock ledger data - would come from API in production (50 entries for 2 pages)
    const [ledgers, setLedgers] = useState(
        Array.from({ length: 50 }, (_, index) => ({
            id: index + 1,
            document_number: `DOC-${String(index + 1).padStart(3, "0")}-2024`,
            action: [
                "issued",
                "amended",
                "shipped",
                "received",
                "paid",
                "cancelled",
                "verified",
            ][index % 7],
            user_name: [
                "John Smith",
                "Admin User",
                "Jane Doe",
                "Mike Johnson",
                "Sarah Wilson",
            ][index % 5],
            created_at: new Date(
                Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            description: `Ledger entry #${index + 1}`,
        }))
    );

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [filterAction, setFilterAction] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedLedger, setSelectedLedger] = useState(null);

    // Form states
    const [uploadForm, setUploadForm] = useState({
        document_number: "",
        description: "",
    });
    const [editForm, setEditForm] = useState({ action: "" });
    const [uploadFile, setUploadFile] = useState(null);

    // Handlers
    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!uploadFile) {
            toast.error("Please select a file");
            return;
        }
        if (!uploadForm.document_number) {
            toast.error("Please enter document number");
            return;
        }

        // Simulate upload - in production, would call API
        const newLedger = {
            id: ledgers.length + 1,
            document_number: uploadForm.document_number,
            action: "issued",
            user_name: "Bank User", // Would come from auth context
            created_at: new Date().toISOString(),
            description: uploadForm.description || "",
        };

        setLedgers([newLedger, ...ledgers]);
        toast.success("Ledger entry created successfully");
        setIsUploadModalOpen(false);
        setUploadForm({ document_number: "", description: "" });
        setUploadFile(null);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedLedger) return;

        if (!editForm.action) {
            toast.error("Please select an action");
            return;
        }

        // Update ledger
        const updatedLedgers = ledgers.map((l) =>
            l.id === selectedLedger.id ? { ...l, action: editForm.action } : l
        );

        setLedgers(updatedLedgers);
        toast.success("Ledger action updated successfully");
        setIsEditModalOpen(false);
        setEditForm({ action: "" });
        setSelectedLedger(null);
    };

    const handleDelete = (ledgerId) => {
        if (
            window.confirm("Are you sure you want to delete this ledger entry?")
        ) {
            setLedgers(ledgers.filter((l) => l.id !== ledgerId));
            toast.success("Ledger entry deleted successfully");
        }
    };

    const handleView = (ledger) => {
        setSelectedLedger(ledger);
        setIsViewModalOpen(true);
    };

    const handleEdit = (ledger) => {
        setSelectedLedger(ledger);
        setEditForm({ action: ledger.action });
        setIsEditModalOpen(true);
    };

    const handleCreateClick = () => {
        setUploadForm({ document_number: "", description: "" });
        setUploadFile(null);
        setIsUploadModalOpen(true);
    };

    const canViewLedgers = role === "admin" || role === "auditor";

    if (!canViewLedgers) {
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
                        Only Admin and Auditor can view ledger entries.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Back Button */}
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Ledger
                        </h1>
                        <p className="text-slate-400">
                            View and manage blockchain ledger entries
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Total Entries
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {ledgers.length}
                                </p>
                            </div>
                            <FileText className="w-12 h-12 text-blue-500/20" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Recent Actions
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {
                                        ledgers.filter(
                                            (l) =>
                                                new Date(l.created_at) >
                                                new Date(Date.now() - 86400000)
                                        ).length
                                    }
                                </p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500/20" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Users Involved
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {
                                        new Set(ledgers.map((l) => l.user_name))
                                            .size
                                    }
                                </p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-orange-500/20" />
                        </div>
                    </div>
                </div>

                {/* Action Bar and Table */}
                <LedgerActionBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filterAction={filterAction}
                    onFilterActionChange={setFilterAction}
                    startDate={startDate}
                    onStartDateChange={setStartDate}
                    onCreateClick={handleCreateClick}
                    userRole={role}
                />

                {/* Ledger Table */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">
                            Ledger Entries
                        </h2>
                    </div>
                    <LedgerTable
                        ledgers={ledgers}
                        searchQuery={searchQuery}
                        filterAction={filterAction}
                        startDate={startDate}
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
            <LedgerUploadModal
                isOpen={isUploadModalOpen}
                formData={uploadForm}
                onFormChange={setUploadForm}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({ document_number: "", description: "" });
                    setUploadFile(null);
                }}
                onSubmit={handleUploadSubmit}
                uploadFile={uploadFile}
                onFileChange={setUploadFile}
            />

            <LedgerEditModal
                isOpen={isEditModalOpen}
                ledger={selectedLedger}
                formData={editForm}
                onFormChange={setEditForm}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditForm({ action: "" });
                    setSelectedLedger(null);
                }}
                onSubmit={handleEditSubmit}
            />

            <LedgerViewModal
                isOpen={isViewModalOpen}
                ledger={selectedLedger}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedLedger(null);
                }}
            />
        </div>
    );
}

export default LedgerPage;
