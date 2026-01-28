import React, { useState, useEffect } from "react";
import {
    FileText,
    CheckCircle,
    Clock,
    TrendingUp,
    Activity,
    Plus,
    CreditCard,
    Ship,
    BookOpen,
    AlertCircle,
} from "lucide-react";
import StatsCard from "./components/StatsCard";
import DocumentTable from "./components/DocumentTable";
import ActionBar from "./components/ActionBar";
import UploadModal from "./components/UploadModal";
import ViewModal from "./components/ViewModal";
import EditModal from "./components/EditModal";
import LedgerPage from "./components/LedgerPage";
import TradeTransactionsPage from "./components/TradeTransactionsPage";
import RiskScoresPage from "./components/RiskScoresPage";
import AuditLogsPage from "./components/AuditLogsPage";
import { useDocuments, useUploadForm } from "./hooks/useDocuments";
import { useAuth } from "./context/AuthContext";
import {
    tradeChainService,
    showSuccessToast,
    showErrorToast,
} from "./api/services";

function Home() {
    const { isAuthenticated, user, role } = useAuth();
    const [activeTab, setActiveTab] = useState("documents");

    // Document Management Hooks
    const {
        documents,
        loading: docsLoading,
        fetchDocuments,
        deleteDocument,
        searchQuery: docSearchQuery,
        setSearchQuery: setDocSearchQuery,
        filterType,
        setFilterType,
        filterStatus,
        setFilterStatus,
    } = useDocuments([]);

    const {
        uploadFile,
        setUploadFile,
        uploadForm,
        setUploadForm,
        resetForm,
        dragActive,
        setDragActive,
    } = useUploadForm({ type: "letter_of_credit", issued_at: "" });

    // Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Fetch documents when authenticated
    useEffect(() => {
        if (isAuthenticated && role) {
            fetchDocuments(role);
        }
    }, [isAuthenticated, role, fetchDocuments]);

    // --- Authenticated Handlers ---

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile)
            return showErrorToast(
                { message: "Please select a file" },
                "Please select a file",
            );
        if (!uploadForm.issued_at)
            return showErrorToast(
                { message: "Please select issued date" },
                "Please select issued date",
            );

        try {
            await tradeChainService.uploadDocuments(
                [uploadFile],
                uploadForm.type,
                uploadForm.issued_at,
            );
            showSuccessToast("Document uploaded successfully");
            setIsUploadModalOpen(false);
            resetForm();
            fetchDocuments(role);
        } catch (error) {
            console.error(error);
            showErrorToast(error, "Upload failed");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDocument) return;

        try {
            await tradeChainService.updateDocument(
                selectedDocument.id,
                uploadForm.type,
            );
            showSuccessToast("Document type updated successfully");
            setIsEditModalOpen(false);
            resetForm();
            fetchDocuments(role);
        } catch (error) {
            console.error(error);
            showErrorToast(error, "Update failed");
        }
    };

    const handleView = (doc) => {
        setSelectedDocument(doc);
        setIsViewModalOpen(true);
    };

    const handleEdit = (doc) => {
        setSelectedDocument(doc);
        setUploadForm({
            type: doc.doc_type,
            issued_at: "",
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (docId) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            await deleteDocument(docId);
        }
    };

    const handleDownload = (doc) => {
        if (doc.file_url) {
            window.open(doc.file_url, "_blank");
        } else {
            showErrorToast(
                { message: "File URL not available" },
                "File URL not available",
            );
        }
    };

    // --- Drag & Drop Handlers ---
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setUploadFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="min-h-full p-6">
            {activeTab === "ledger" ? (
                <LedgerPage onClose={() => setActiveTab("documents")} />
            ) : activeTab === "tradeTransactions" ? (
                <TradeTransactionsPage
                    onClose={() => setActiveTab("documents")}
                />
            ) : activeTab === "riskScores" ? (
                <RiskScoresPage onClose={() => setActiveTab("documents")} />
            ) : activeTab === "auditLogs" ? (
                <AuditLogsPage onClose={() => setActiveTab("documents")} />
            ) : (
                <>
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Dashboard
                                </h1>
                                <p className="text-slate-400">
                                    Welcome back, {user?.name || user?.email}
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 border-b border-white/10 pb-4">
                            <button
                                onClick={() => setActiveTab("documents")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeTab === "documents"
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-400 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <FileText className="w-5 h-5" />
                                Documents
                            </button>
                            {(role === "admin" ||
                                role === "auditor" ||
                                role === "bank" ||
                                role === "corporate") && (
                                <button
                                    onClick={() => setActiveTab("ledger")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        activeTab === "ledger"
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-400 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                    <BookOpen className="w-5 h-5" />
                                    Ledger
                                </button>
                            )}
                            {(role === "admin" ||
                                role === "auditor" ||
                                role === "bank" ||
                                role === "corporate") && (
                                <button
                                    onClick={() =>
                                        setActiveTab("tradeTransactions")
                                    }
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        activeTab === "tradeTransactions"
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-400 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                    <TrendingUp className="w-5 h-5" />
                                    Trade Transactions
                                </button>
                            )}
                            {(role === "admin" ||
                                role === "auditor" ||
                                role === "bank" ||
                                role === "corporate") && (
                                <button
                                    onClick={() => setActiveTab("riskScores")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        activeTab === "riskScores"
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-400 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                    <AlertCircle className="w-5 h-5" />
                                    Risk Scores
                                </button>
                            )}
                            {(role === "admin" ||
                                role === "auditor" ||
                                role === "bank" ||
                                role === "corporate") && (
                                <button
                                    onClick={() => setActiveTab("auditLogs")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        activeTab === "auditLogs"
                                            ? "bg-blue-600 text-white"
                                            : "text-slate-400 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                    <Activity className="w-5 h-5" />
                                    Audit Logs
                                </button>
                            )}
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatsCard
                                label="Total Documents"
                                value={documents.length}
                                icon={FileText}
                                color="bg-blue-500"
                            />
                            <StatsCard
                                label="Letters of Credit"
                                value={
                                    documents.filter(
                                        (d) =>
                                            d.doc_type === "letter_of_credit",
                                    ).length
                                }
                                icon={CreditCard}
                                color="bg-yellow-500"
                            />
                            <StatsCard
                                label="Bills of Lading"
                                value={
                                    documents.filter(
                                        (d) => d.doc_type === "bill_of_lading",
                                    ).length
                                }
                                icon={Ship}
                                color="bg-green-500"
                            />
                            <StatsCard
                                label="Invoices"
                                value={
                                    documents.filter(
                                        (d) => d.doc_type === "invoice",
                                    ).length
                                }
                                icon={FileText}
                                color="bg-purple-500"
                            />
                        </div>

                        {/* Action Bar */}
                        <ActionBar
                            searchQuery={docSearchQuery}
                            onSearchChange={setDocSearchQuery}
                            filterType={filterType}
                            onFilterTypeChange={setFilterType}
                            filterStatus={filterStatus}
                            onFilterStatusChange={setFilterStatus}
                            onUploadClick={() => setIsUploadModalOpen(true)}
                            userRole={role}
                        />

                        {/* Document Table */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-lg font-semibold text-white">
                                    {role === "admin" || role === "auditor"
                                        ? "All Documents"
                                        : "My Documents"}
                                </h2>
                            </div>
                            <DocumentTable
                                documents={documents}
                                searchQuery={docSearchQuery}
                                filterType={filterType}
                                filterStatus={filterStatus}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onDownload={handleDownload}
                                userRole={role}
                                currentUsername={user?.name}
                            />
                        </div>
                    </div>

                    {/* Modals */}
                    <UploadModal
                        isOpen={isUploadModalOpen}
                        onClose={() => {
                            setIsUploadModalOpen(false);
                            resetForm();
                        }}
                        uploadFile={uploadFile}
                        onFileChange={setUploadFile}
                        uploadForm={uploadForm}
                        onFormChange={setUploadForm}
                        onSubmit={handleUploadSubmit}
                        dragActive={dragActive}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    />

                    <ViewModal
                        isOpen={isViewModalOpen}
                        onClose={() => {
                            setIsViewModalOpen(false);
                            setSelectedDocument(null);
                        }}
                        document={selectedDocument}
                        onDownload={() => handleDownload(selectedDocument)}
                        userRole={role}
                    />

                    <EditModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedDocument(null);
                            resetForm();
                        }}
                        document={selectedDocument}
                        uploadForm={uploadForm}
                        onFormChange={setUploadForm}
                        onSubmit={handleEditSubmit}
                    />
                </>
            )}
        </div>
    );
}

export default Home;
