import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    FileText,
    TrendingUp,
    Activity,
    CreditCard,
    Ship,
    BookOpen,
    AlertCircle,
    ShoppingCart,
    Globe,
    Shield,
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

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/** Roles that have access to all main features */
const ALL_ROLES = ["admin", "auditor", "bank", "corporate"];

/** Roles that have admin-level access */
const ADMIN_ROLES = ["admin", "auditor"];

/** Navigation tab configuration */
const TAB_CONFIG = [
    {
        id: "documents",
        label: "Documents",
        icon: FileText,
        roles: null, // Available to all authenticated users
    },
    {
        id: "ledger",
        label: "Ledger",
        icon: BookOpen,
        roles: ALL_ROLES,
    },
    {
        id: "tradeTransactions",
        label: "Trade Transactions",
        icon: TrendingUp,
        roles: ALL_ROLES,
    },
    {
        id: "riskScores",
        label: "Risk Scores",
        icon: AlertCircle,
        roles: ALL_ROLES,
    },
    {
        id: "auditLogs",
        label: "Audit Logs",
        icon: Activity,
        roles: ADMIN_ROLES,
    },
];

/** Document type statistics configuration */
const STATS_CONFIG = [
    {
        label: "Total Documents",
        docType: null, // Count all documents
        icon: FileText,
        color: "bg-blue-500",
    },
    {
        label: "Letters of Credit",
        docType: "letter_of_credit",
        icon: CreditCard,
        color: "bg-yellow-500",
    },
    {
        label: "Bills of Lading",
        docType: "bill_of_lading",
        icon: Ship,
        color: "bg-green-500",
    },
    {
        label: "Invoices",
        docType: "invoice",
        icon: FileText,
        color: "bg-purple-500",
    },
    {
        label: "Purchase Orders",
        docType: "purchase_order",
        icon: ShoppingCart,
        color: "bg-orange-500",
    },
    {
        label: "Certificates of Origin",
        docType: "certificate_of_origin",
        icon: Globe,
        color: "bg-teal-500",
    },
    {
        label: "Insurance Certs",
        docType: "insurance_certificate",
        icon: Shield,
        color: "bg-pink-500",
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts filename from Content-Disposition header.
 * Supports both standard filename= and RFC 5987 filename*= encoding.
 * @param {string} contentDisposition - The Content-Disposition header value
 * @param {string} fallback - Fallback filename if extraction fails
 * @returns {string} The extracted or fallback filename
 */
const extractFilename = (contentDisposition, fallback) => {
    if (!contentDisposition) return fallback;

    // Try filename*= first (RFC 5987 encoding)
    const filenameStarMatch = contentDisposition.match(
        /filename\*=UTF-8''([^;\n]*)/i,
    );
    if (filenameStarMatch?.[1]) {
        return decodeURIComponent(filenameStarMatch[1]);
    }

    // Fall back to filename=
    const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/i);
    if (filenameMatch?.[1]) {
        return filenameMatch[1].trim();
    }

    return fallback;
};

/**
 * Triggers a file download from a blob response.
 * @param {Blob} blob - The file blob
 * @param {string} filename - The filename for the download
 */
const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Dashboard header component displaying title and user info.
 */
const DashboardHeader = ({ user, role }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400">
                Welcome back, {user?.name || user?.email}, {role || ""}
            </p>
        </div>
    </div>
);

/**
 * Navigation tab button component.
 */
const TabButton = ({ tab, isActive, onClick }) => {
    const Icon = tab.icon;
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
            }`}
        >
            <Icon className="w-5 h-5" />
            {tab.label}
        </button>
    );
};

/**
 * Navigation tabs container component.
 */
const NavigationTabs = ({ tabs, activeTab, onTabChange, userRole }) => (
    <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
        {tabs.map((tab) => {
            // Check if user has access to this tab
            const hasAccess = !tab.roles || tab.roles.includes(userRole);
            if (!hasAccess) return null;

            return (
                <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                />
            );
        })}
    </div>
);

/**
 * Stats cards grid component.
 * Note: With backend pagination, doc type counts are for current page only.
 * Total Documents uses totalCount from backend.
 */
const StatsGrid = ({ documents, totalCount, config }) => {
    const getCount = useCallback(
        (docType) => {
            if (!docType) return totalCount;
            return documents.filter((d) => d.doc_type === docType).length;
        },
        [documents, totalCount],
    );

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
            {config.map((stat) => (
                <StatsCard
                    key={stat.label}
                    label={stat.label}
                    value={getCount(stat.docType)}
                    icon={stat.icon}
                    color={stat.color}
                />
            ))}
        </div>
    );
};

/**
 * Document table section with header.
 */
const DocumentSection = ({ role, children }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">
                {ADMIN_ROLES.includes(role) ? "All Documents" : "My Documents"}
            </h2>
        </div>
        {children}
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function Home() {
    const { isAuthenticated, user, role } = useAuth();
    const [activeTab, setActiveTab] = useState("documents");

    // Document Management Hooks
    const {
        documents,
        totalDocuments,
        fetchDocuments,
        deleteDocument,
        searchQuery: docSearchQuery,
        setSearchQuery: setDocSearchQuery,
        filterType,
        setFilterType,
        currentPage,
        setCurrentPage,
        itemsPerPage,
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

    // Calculate skip for backend pagination
    const skip = (currentPage - 1) * itemsPerPage;

    // Fetch documents when authenticated or pagination changes
    useEffect(() => {
        if (isAuthenticated && role) {
            fetchDocuments(role, skip, itemsPerPage);
        }
    }, [
        isAuthenticated,
        role,
        currentPage,
        fetchDocuments,
        skip,
        itemsPerPage,
    ]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [docSearchQuery, filterType, setCurrentPage]);

    // ========================================================================
    // EVENT HANDLERS
    // ========================================================================

    const handleUploadSubmit = useCallback(
        async (e) => {
            e.preventDefault();

            if (!uploadFile) {
                return showErrorToast(
                    { message: "Please select a file" },
                    "Please select a file",
                );
            }
            if (!uploadForm.issued_at) {
                return showErrorToast(
                    { message: "Please select issued date" },
                    "Please select issued date",
                );
            }

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
        },
        [uploadFile, uploadForm, resetForm, fetchDocuments, role],
    );

    const handleEditSubmit = useCallback(
        async (e) => {
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
        },
        [selectedDocument, uploadForm.type, resetForm, fetchDocuments, role],
    );

    const handleView = useCallback((doc) => {
        setSelectedDocument(doc);
        setIsViewModalOpen(true);
    }, []);

    const handleEdit = useCallback(
        (doc) => {
            setSelectedDocument(doc);
            setUploadForm({ type: doc.doc_type, issued_at: "" });
            setIsEditModalOpen(true);
        },
        [setUploadForm],
    );

    const handleDelete = useCallback(
        async (docId) => {
            if (
                window.confirm("Are you sure you want to delete this document?")
            ) {
                await deleteDocument(docId);
            }
        },
        [deleteDocument],
    );

    const handleDownload = useCallback(async (doc) => {
        if (!doc?.id) {
            showErrorToast(
                { message: "Document ID not available" },
                "Document ID not available",
            );
            return;
        }

        try {
            const response = await tradeChainService.downloadDocument(doc.id);

            const contentType =
                response.headers["content-type"] || "application/octet-stream";
            const blob = new Blob([response.data], { type: contentType });

            const filename = extractFilename(
                response.headers["content-disposition"],
                `document_${doc.id}`,
            );

            triggerDownload(blob, filename);
            showSuccessToast("Document downloaded successfully");
        } catch (error) {
            console.error(error);
            showErrorToast(error, "Download failed");
        }
    }, []);

    // ========================================================================
    // DRAG & DROP HANDLERS
    // ========================================================================

    const handleDrag = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isDragEnterOrOver =
                e.type === "dragenter" || e.type === "dragover";
            setDragActive(isDragEnterOrOver);
        },
        [setDragActive],
    );

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) setUploadFile(file);
        },
        [setDragActive, setUploadFile],
    );

    // ========================================================================
    // MODAL HANDLERS
    // ========================================================================

    const closeUploadModal = useCallback(() => {
        setIsUploadModalOpen(false);
        resetForm();
    }, [resetForm]);

    const closeViewModal = useCallback(() => {
        setIsViewModalOpen(false);
        setSelectedDocument(null);
    }, []);

    const closeEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setSelectedDocument(null);
        resetForm();
    }, [resetForm]);

    // ========================================================================
    // RENDER HELPERS
    // ========================================================================

    /** Renders the appropriate page based on active tab */
    const renderTabContent = useMemo(() => {
        const tabPages = {
            ledger: <LedgerPage onClose={() => setActiveTab("documents")} />,
            tradeTransactions: (
                <TradeTransactionsPage
                    onClose={() => setActiveTab("documents")}
                />
            ),
            riskScores: (
                <RiskScoresPage onClose={() => setActiveTab("documents")} />
            ),
            auditLogs: (
                <AuditLogsPage onClose={() => setActiveTab("documents")} />
            ),
        };

        return tabPages[activeTab] || null;
    }, [activeTab]);

    // ========================================================================
    // RENDER
    // ========================================================================

    // Render sub-pages for non-document tabs
    if (activeTab !== "documents" && renderTabContent) {
        return <div className="min-h-full p-6">{renderTabContent}</div>;
    }

    // Render main documents dashboard
    return (
        <div className="min-h-full p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <DashboardHeader user={user} role={role} />

                <NavigationTabs
                    tabs={TAB_CONFIG}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    userRole={role}
                />

                <StatsGrid
                    documents={documents}
                    totalCount={totalDocuments}
                    config={STATS_CONFIG}
                />

                <ActionBar
                    searchQuery={docSearchQuery}
                    onSearchChange={setDocSearchQuery}
                    filterType={filterType}
                    onFilterTypeChange={setFilterType}
                    onUploadClick={() => setIsUploadModalOpen(true)}
                    userRole={role}
                />

                <DocumentSection role={role}>
                    <DocumentTable
                        documents={documents}
                        totalItems={totalDocuments}
                        searchQuery={docSearchQuery}
                        filterType={filterType}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDownload={handleDownload}
                        userRole={role}
                        currentUsername={user?.name}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </DocumentSection>
            </div>

            {/* Modals */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={closeUploadModal}
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
                onClose={closeViewModal}
                document={selectedDocument}
                onDownload={() => handleDownload(selectedDocument)}
                userRole={role}
            />

            <EditModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                document={selectedDocument}
                uploadForm={uploadForm}
                onFormChange={setUploadForm}
                onSubmit={handleEditSubmit}
            />
        </div>
    );
}

export default Home;
