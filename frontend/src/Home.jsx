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
} from "lucide-react";
import StatsCard from "./components/StatsCard";
import DocumentTable from "./components/DocumentTable";
import ActionBar from "./components/ActionBar";
import UploadModal from "./components/UploadModal";
import ViewModal from "./components/ViewModal";
import EditModal from "./components/EditModal";
import { useDocuments, useUploadForm } from "./hooks/useDocuments";
import { useAuth } from "./context/AuthContext";
import api from "./api/axios";
import { toast } from "react-hot-toast";

function Home() {
    const { isAuthenticated, user, role } = useAuth();

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
        if (!uploadFile) return toast.error("Please select a file");
        if (!uploadForm.issued_at)
            return toast.error("Please select issued date");

        const formData = new FormData();
        formData.append("files", uploadFile);
        formData.append("doc_type", uploadForm.type);
        formData.append(
            "issued_at",
            new Date(uploadForm.issued_at).toISOString()
        );

        try {
            await api.post("/api/trade_chain/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Document uploaded successfully");
            setIsUploadModalOpen(false);
            resetForm();
            fetchDocuments(role);
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDocument) return;

        const formData = new FormData();
        if (uploadFile) {
            formData.append("file", uploadFile);
        }
        formData.append("doc_type", uploadForm.type);

        try {
            await api.put(
                `/api/trade_chain/document/${selectedDocument.id}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            toast.success("Document updated successfully");
            setIsEditModalOpen(false);
            resetForm();
            fetchDocuments(role);
        } catch (error) {
            console.error(error);
            toast.error("Update failed");
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
            toast.error("File URL not available");
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
                                (d) => d.doc_type === "letter_of_credit"
                            ).length
                        }
                        icon={CreditCard}
                        color="bg-yellow-500"
                    />
                    <StatsCard
                        label="Bills of Lading"
                        value={
                            documents.filter(
                                (d) => d.doc_type === "bill_of_lading"
                            ).length
                        }
                        icon={Ship}
                        color="bg-green-500"
                    />
                    <StatsCard
                        label="Invoices"
                        value={
                            documents.filter((d) => d.doc_type === "invoice")
                                .length
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
                uploadFile={uploadFile}
                onFileChange={setUploadFile}
            />
        </div>
    );
}

export default Home;
