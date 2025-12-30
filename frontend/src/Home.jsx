import React, { useMemo } from "react";
import {
    FileText,
    CheckCircle,
    Clock,
    TrendingUp,
    Activity,
} from "lucide-react";
import StatsCard from "./components/StatsCard";
import ActionBar from "./components/ActionBar";
import DocumentTable from "./components/DocumentTable";
import UploadModal from "./components/UploadModal";
import ViewModal from "./components/ViewModal";
import EditModal from "./components/EditModal";
import { useDocuments, useUploadForm, useModals } from "./hooks/useDocuments";
import { useAuth } from "./context/AuthContext";

function Home() {
    // Get authentication context for role-based rendering
    const { user, role } = useAuth();
    const userRole = role || "corporate"; // Default to corporate if role not defined
    const isAdmin = userRole === "admin";
    const currentUserId = user?.uid || user?.id || ""; // Get current user ID for filtering

    const sampleDocuments = [];
    // Use custom hooks for state management
    const {
        documents,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        filterStatus,
        setFilterStatus,
        addDocument,
        updateDocument,
        deleteDocument,
    } = useDocuments(sampleDocuments);

    // Filter documents based on user role
    // Admin: sees all documents
    // Corporate/Bank: sees only their own documents
    const visibleDocuments = useMemo(() => {
        if (isAdmin) {
            return documents;
        }
        // For non-admin users, filter documents by owner
        return documents.filter(
            (doc) =>
                doc.ownerId === currentUserId || doc.uploadedBy === user?.name
        );
    }, [documents, isAdmin, currentUserId, user?.name]);

    const {
        uploadFile,
        setUploadFile,
        uploadForm,
        setUploadForm,
        resetForm: resetUploadForm,
        dragActive,
        setDragActive,
    } = useUploadForm({
        name: "",
        type: "loc",
        description: "",
    });

    const {
        showUploadModal,
        setShowUploadModal,
        showViewModal,
        setShowViewModal,
        showEditModal,
        setShowEditModal,
        selectedDocument,
        setSelectedDocument,
    } = useModals();

    // Handle file drag and drop
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

    const handleFileChange = (file) => {
        setUploadFile(file);
    };

    // Handle document actions
    const handleView = (doc) => {
        setSelectedDocument(doc);
        setShowViewModal(true);
    };

    const handleEdit = (doc) => {
        setSelectedDocument(doc);
        setUploadForm({
            name: doc.name,
            type: doc.type,
            description: "",
        });
        setShowEditModal(true);
    };

    const handleDelete = (docId) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            deleteDocument(docId);
        }
    };

    // Handle document download
    const handleDownload = (doc) => {
        // In a real implementation, this would download the actual file
        // For now, we'll simulate the download
        console.log("Downloading document:", doc.name);

        // Create a mock download (in production, this would be an API call)
        const element = document.createElement("a");
        element.setAttribute(
            "href",
            `data:text/plain;charset=utf-8,Document: ${doc.name}%0AType: ${doc.type}%0ATX Hash: ${doc.txHash}`
        );
        element.setAttribute("download", `${doc.name}.txt`);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        const newDoc = {
            id: documents.length + 1,
            name: uploadForm.name || uploadFile.name,
            type: uploadForm.type,
            status: "pending",
            uploadedBy: user?.name || "Current User",
            ownerId: currentUserId,
            uploadedAt: new Date().toISOString().split("T")[0],
            txHash: "0x" + Math.random().toString(16).slice(2, 14) + "...",
            size: (uploadFile.size / (1024 * 1024)).toFixed(2) + " MB",
        };

        addDocument(newDoc);
        setShowUploadModal(false);
        resetUploadForm();
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        updateDocument(selectedDocument.id, {
            name: uploadForm.name,
            type: uploadForm.type,
        });
        setShowEditModal(false);
        setSelectedDocument(null);
    };

    // Stats data - show stats for visible documents based on role
    const stats = [
        {
            label: "Total Documents",
            value: visibleDocuments.length,
            icon: FileText,
            color: "bg-blue-500",
        },
        {
            label: "Verified",
            value: visibleDocuments.filter((d) => d.status === "verified")
                .length,
            icon: CheckCircle,
            color: "bg-green-500",
        },
        {
            label: "Pending",
            value: visibleDocuments.filter((d) => d.status === "pending")
                .length,
            icon: Clock,
            color: "bg-yellow-500",
        },
        {
            label: "In Progress",
            value: visibleDocuments.filter((d) => d.status === "in_progress")
                .length,
            icon: TrendingUp,
            color: "bg-purple-500",
        },
    ];

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Trade Finance Blockchain Explorer
                            </h1>
                            <p className="text-slate-400">
                                Manage, verify, and track your trade finance
                                documents on the blockchain
                            </p>
                        </div>
                        {/* Role Badge */}
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-sm">
                                Logged in as:
                            </span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                                    isAdmin
                                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                        : userRole === "bank"
                                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                          : "bg-green-500/20 text-green-400 border border-green-500/30"
                                }`}
                            >
                                {userRole}
                            </span>
                        </div>
                    </div>
                    {/* Role-specific info message */}
                    {isAdmin ? (
                        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                            <p className="text-amber-300 text-sm">
                                <span className="font-medium">Admin View:</span>{" "}
                                You can view all documents, edit them, and
                                delete them. Document uploads and downloads are
                                handled by banks and corporates.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <p className="text-blue-300 text-sm">
                                <span className="font-medium">Note:</span> As a{" "}
                                {userRole}, you can upload, view, and download
                                your own documents.
                            </p>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <StatsCard
                            key={index}
                            label={stat.label}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                        />
                    ))}
                </div>

                {/* Actions Bar */}
                <ActionBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filterType={filterType}
                    onFilterTypeChange={setFilterType}
                    filterStatus={filterStatus}
                    onFilterStatusChange={setFilterStatus}
                    onUploadClick={() => setShowUploadModal(true)}
                    userRole={userRole}
                />

                {/* Documents Table */}
                <DocumentTable
                    documents={visibleDocuments}
                    searchQuery={searchQuery}
                    filterType={filterType}
                    filterStatus={filterStatus}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDownload={handleDownload}
                    userRole={userRole}
                    currentUsername={user?.name || ""}
                />

                {/* Upload Modal */}
                <UploadModal
                    isOpen={showUploadModal}
                    onClose={() => {
                        setShowUploadModal(false);
                        resetUploadForm();
                    }}
                    uploadFile={uploadFile}
                    onFileChange={handleFileChange}
                    uploadForm={uploadForm}
                    onFormChange={setUploadForm}
                    onSubmit={handleUploadSubmit}
                    dragActive={dragActive}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                />

                {/* View Modal */}
                <ViewModal
                    isOpen={showViewModal}
                    document={selectedDocument}
                    onClose={() => setShowViewModal(false)}
                    onEdit={handleEdit}
                    onDownload={handleDownload}
                    userRole={userRole}
                />

                {/* Edit Modal */}
                <EditModal
                    isOpen={showEditModal}
                    document={selectedDocument}
                    uploadForm={uploadForm}
                    onFormChange={setUploadForm}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedDocument(null);
                    }}
                    onSubmit={handleEditSubmit}
                />
            </div>
        </div>
    );
}

export default Home;
