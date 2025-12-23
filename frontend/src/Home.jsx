import React from "react";
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

// Sample documents data
const sampleDocuments = [
    {
        id: 1,
        name: "Letter of Credit - ABC Corp",
        type: "loc",
        status: "verified",
        uploadedBy: "John Doe",
        uploadedAt: "2025-12-09",
        txHash: "0x1a2b3c...4d5e6f",
        size: "2.4 MB",
    },
    {
        id: 2,
        name: "Invoice #INV-2025-001",
        type: "invoice",
        status: "pending",
        uploadedBy: "Jane Smith",
        uploadedAt: "2025-12-08",
        txHash: "0x7g8h9i...0j1k2l",
        size: "1.2 MB",
    },
    {
        id: 3,
        name: "Bill of Lading - Shipment #45892",
        type: "bill_of_lading",
        status: "in_progress",
        uploadedBy: "Mike Wilson",
        uploadedAt: "2025-12-07",
        txHash: "0x3m4n5o...6p7q8r",
        size: "3.8 MB",
    },
    {
        id: 4,
        name: "Purchase Order - PO-2025-089",
        type: "po",
        status: "completed",
        uploadedBy: "Sarah Johnson",
        uploadedAt: "2025-12-06",
        txHash: "0x9s0t1u...2v3w4x",
        size: "890 KB",
    },
    {
        id: 5,
        name: "Certificate of Origin - China Export",
        type: "coo",
        status: "disputed",
        uploadedBy: "Tom Brown",
        uploadedAt: "2025-12-05",
        txHash: "0x5y6z7a...8b9c0d",
        size: "1.5 MB",
    },
];

function Home() {
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

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!uploadFile) return;

        const newDoc = {
            id: documents.length + 1,
            name: uploadForm.name || uploadFile.name,
            type: uploadForm.type,
            status: "pending",
            uploadedBy: "Current User",
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

    // Stats data
    const stats = [
        {
            label: "Total Documents",
            value: documents.length,
            icon: FileText,
            color: "bg-blue-500",
        },
        {
            label: "Verified",
            value: documents.filter((d) => d.status === "verified").length,
            icon: CheckCircle,
            color: "bg-green-500",
        },
        {
            label: "Pending",
            value: documents.filter((d) => d.status === "pending").length,
            icon: Clock,
            color: "bg-yellow-500",
        },
        {
            label: "In Progress",
            value: documents.filter((d) => d.status === "in_progress").length,
            icon: TrendingUp,
            color: "bg-purple-500",
        },
    ];

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Trade Finance Blockchain Explorer
                    </h1>
                    <p className="text-slate-400">
                        Manage, verify, and track your trade finance documents
                        on the blockchain
                    </p>
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
                />

                {/* Documents Table */}
                <DocumentTable
                    documents={documents}
                    searchQuery={searchQuery}
                    filterType={filterType}
                    filterStatus={filterStatus}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
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
