import React, { useState, useEffect } from "react";
import { FileText, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import LedgerTable from "./LedgerTable";
import LedgerActionBar from "./LedgerActionBar";
import LedgerUploadModal from "./LedgerUploadModal";
import LedgerEditModal from "./LedgerEditModal";
import LedgerViewModal from "./LedgerViewModal";
import { useAuth } from "../context/AuthContext";
import {
    ledgerService,
    tradeChainService,
    showSuccessToast,
    showErrorToast,
} from "../api/services";

/**
 * LedgerPage Component
 * Displays paginated list of ledger entries
 */
function LedgerPage({ onClose }) {
    const { role } = useAuth();

    // Data states
    const [ledgers, setLedgers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        recent: 0,
        users: 0,
    });

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

    // Documents list for dropdown
    const [documents, setDocuments] = useState([]);

    // Helpers
    const isPrivileged = role === "admin" || role === "auditor";

    const fetchLedgers = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                page_size: 25,
            };

            if (searchQuery) params.document_number = searchQuery;
            if (filterAction !== "all") params.action = filterAction;
            if (startDate) params.start_date = startDate;

            let data;
            if (isPrivileged) {
                data = await ledgerService.getAllRecords(params);
            } else {
                data = await ledgerService.getMyRecords(params);
            }

            setLedgers(data.items);
            setTotalItems(data.total);

            // Stats should ideally come from backend or separate endpoint
            // For now, using what we have or placeholder
            setStats((prev) => ({
                ...prev,
                total: data.total,
                users: new Set(data.items.map((l) => l.user_name)).size, // Only counts users on current page
            }));
        } catch (error) {
            console.error("Failed to fetch ledgers:", error);
            showErrorToast(error, "Failed to fetch ledger records");
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async () => {
        if (role !== "bank" && role !== "corporate") return;
        try {
            const response = await tradeChainService.getMyDocuments();
            setDocuments(response || []);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        }
    };

    useEffect(() => {
        fetchLedgers();
    }, [currentPage, searchQuery, filterAction, startDate, role]);

    useEffect(() => {
        if (isUploadModalOpen) {
            fetchDocuments();
        }
    }, [isUploadModalOpen, role]);

    // Handlers
    const handleUploadSubmit = async (e) => {
        e.preventDefault();

        if (!uploadForm.document_number) {
            showErrorToast(
                { message: "Please select a document" },
                "Please select a document",
            );
            return;
        }

        // Find document ID from selected document number
        const doc = documents.find(
            (d) => d.doc_number === uploadForm.document_number,
        );

        if (!doc) {
            showErrorToast(
                { message: "Invalid document selected" },
                "Invalid document selected",
            );
            return;
        }

        try {
            await ledgerService.createEntry(doc.id, "issued", {
                description: uploadForm.description || "",
            });

            showSuccessToast("Ledger entry created successfully");
            setIsUploadModalOpen(false);
            setUploadForm({
                document_number: "",
                description: "",
            });
            fetchLedgers();
        } catch (error) {
            console.error("Create ledger error:", error);
            showErrorToast(error, "Failed to create ledger entry");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLedger) return;

        if (!editForm.action) {
            showErrorToast(
                { message: "Please select an action" },
                "Please select an action",
            );
            return;
        }

        try {
            await ledgerService.updateRecord(
                selectedLedger.id,
                editForm.action,
            );

            showSuccessToast("Ledger action updated successfully");
            setIsEditModalOpen(false);
            setEditForm({ action: "" });
            setSelectedLedger(null);
            fetchLedgers();
        } catch (error) {
            console.error("Update ledger error:", error);
            showErrorToast(error, "Failed to update ledger");
        }
    };

    const handleDelete = async (ledgerId) => {
        if (
            window.confirm("Are you sure you want to delete this ledger entry?")
        ) {
            try {
                await ledgerService.deleteRecord(ledgerId);
                showSuccessToast("Ledger entry deleted successfully");
                fetchLedgers();
            } catch (error) {
                console.error("Delete ledger error:", error);
                showErrorToast(error, "Failed to delete ledger entry");
            }
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
        setIsUploadModalOpen(true);
    };

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
                                    {stats.total}
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
                                    {stats.recent}
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
                                    {stats.users}
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
                        totalItems={totalItems}
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
                }}
                onSubmit={handleUploadSubmit}
                documents={documents}
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
