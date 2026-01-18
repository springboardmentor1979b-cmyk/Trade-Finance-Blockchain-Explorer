import React, { useState, useEffect } from "react";
import { FileText, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import LedgerTable from "./LedgerTable";
import LedgerActionBar from "./LedgerActionBar";
import LedgerUploadModal from "./LedgerUploadModal";
import LedgerEditModal from "./LedgerEditModal";
import LedgerViewModal from "./LedgerViewModal";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import api from "../api/axios";

/**
 * LedgerPage Component
 * Displays paginated list of ledger entries
 */
function LedgerPage({ onClose }) {
    const { role } = useAuth();

<<<<<<< HEAD
    // Check privileges
    const isPrivileged = role === "admin" || role === "auditor";
    const canCreate = role === "bank" || role === "corporate";

    // Mock ledger data - 50 comprehensive samples for testing
    const generateSampleLedgers = () => {
        const actions = ["issued", "amended", "shipped", "received", "paid", "cancelled", "verified"];
        const companies = [
            "TechCorp Inc",
            "Global Traders Ltd",
            "Import Export Co",
            "Finance Solutions",
            "Trade Partners",
            "International Commerce",
            "Digital Supply Chain",
            "Pacific Trading",
            "Atlantic Logistics",
            "European Exports"
        ];
        const adminUsers = [
            "John Smith",
            "Admin User",
            "Jane Doe",
            "Mike Johnson",
            "Sarah Wilson"
        ];
        
        const ledgers = [];
        
        // Generate 50 entries: ~17 bank/corporate, ~33 admin
        for (let i = 0; i < 50; i++) {
            const isBankEntry = i % 3 === 0; // Every 3rd entry is bank/corporate
            const user = isBankEntry 
                ? (i % 2 === 0 ? "Bank User" : "Corporate User")
                : adminUsers[i % adminUsers.length];
            
            const action = actions[i % actions.length];
            const company = companies[i % companies.length];
            const docNum = String(i + 1).padStart(3, "0");
            
            ledgers.push({
                id: i + 1,
                document_number: `DOC-${docNum}-2024-${String((i % 10) + 1).padStart(2, "0")}`,
                action: action,
                user_name: user,
                created_at: new Date(
                    Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
                ).toISOString(),
                description: `${company} - ${action.toUpperCase()} - Entry #${i + 1}`,
            });
        }
        
        return ledgers;
    };

    const [ledgers, setLedgers] = useState(generateSampleLedgers());
=======
    // Data states
    const [ledgers, setLedgers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        recent: 0,
        users: 0,
    });
>>>>>>> e662a5b2cb84393a6f0842d0d1e1e094ed8ecf9e

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
        doc_type: "",
        issued_at: "",
    });
    const [editForm, setEditForm] = useState({ action: "" });
    const [uploadFile, setUploadFile] = useState(null);

    // Documents list for dropdown
    const [documents, setDocuments] = useState([]);

    // Helpers
    const isPrivileged = role === "admin" || role === "auditor";

    const fetchLedgers = async () => {
        try {
            setLoading(true);
            const endpoint = isPrivileged
                ? "/api/ledger/records/admin"
                : "/api/ledger/records/user";

            const params = {
                page: currentPage,
                page_size: 25,
            };

            if (searchQuery) params.document_number = searchQuery;
            if (filterAction !== "all") params.action = filterAction;
            if (startDate) params.start_date = startDate;

            const response = await api.get(endpoint, { params });
            const data = response.data;

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
            toast.error("Failed to fetch ledger records");
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async () => {
        if (role !== "bank" && role !== "corporate") return;
        try {
            const response = await api.get("/api/trade_chain/document");
            setDocuments(response.data || []);
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

        // FLOW 1: New Document Upload
        if (uploadFile) {
            if (!uploadForm.doc_type || !uploadForm.issued_at) {
                toast.error(
                    "Please fill in all required fields for new document."
                );
                return;
            }

            try {
                const formData = new FormData();
                formData.append("files", uploadFile); // Note: Backend expects 'files' list
                formData.append("doc_type", uploadForm.doc_type);
                formData.append(
                    "issued_at",
                    new Date(uploadForm.issued_at).toISOString()
                );

                const uploadRes = await api.post(
                    "/api/trade_chain/upload",
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );

                const newDocs = uploadRes.data;
                if (!newDocs || newDocs.length === 0)
                    throw new Error("No document returned");
                const newDoc = newDocs[0];

                await api.post("/api/ledger/entry", {
                    document_id: newDoc.id,
                    action: "issued",
                    metadatav: {
                        description: uploadForm.description || "Initial upload",
                    },
                });

                toast.success("Document uploaded and ledger entry created");
                setIsUploadModalOpen(false);
                setUploadForm({
                    document_number: "",
                    description: "",
                    doc_type: "",
                    issued_at: "",
                });
                setUploadFile(null);
                fetchLedgers();
                fetchDocuments(); // Refresh documents list
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Failed to upload document and create entry");
            }
            return;
        }

        // FLOW 2: Existing Document Ledger Entry
        if (!uploadForm.document_number) {
            toast.error("Please enter/select document number");
            return;
        }

        let docId = null;
        if (documents.length > 0) {
            const doc = documents.find(
                (d) => d.doc_number === uploadForm.document_number
            );
            if (doc) docId = doc.id;
        }

        if (!docId) {
            if (documents.length === 0) {
                toast.error(
                    "Unable to verify document. Please ensure documents are loaded."
                );
                return;
            }
            toast.error("Invalid Document Number selected.");
            return;
        }

        try {
            await api.post("/api/ledger/entry", {
                document_id: docId,
                action: "issued",
                metadatav: {
                    description: uploadForm.description,
                },
            });

            toast.success("Ledger entry created successfully");
            setIsUploadModalOpen(false);
            setUploadForm({
                document_number: "",
                description: "",
                doc_type: "",
                issued_at: "",
            });
            setUploadFile(null);
            fetchLedgers();
        } catch (error) {
            console.error("Create ledger error:", error);
            toast.error("Failed to create ledger entry");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLedger) return;

        if (!editForm.action) {
            toast.error("Please select an action");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("action", editForm.action);

            await api.patch(
                `/api/ledger/records/${selectedLedger.id}`,
                formData
            );

            toast.success("Ledger action updated successfully");
            setIsEditModalOpen(false);
            setEditForm({ action: "" });
            setSelectedLedger(null);
            fetchLedgers();
        } catch (error) {
            console.error("Update ledger error:", error);
            toast.error("Failed to update ledger");
        }
    };

    const handleDelete = async (ledgerId) => {
        if (
            window.confirm("Are you sure you want to delete this ledger entry?")
        ) {
            try {
                await api.delete(`/api/ledger/records/${ledgerId}`);
                toast.success("Ledger entry deleted successfully");
                fetchLedgers();
            } catch (error) {
                console.error("Delete ledger error:", error);
                toast.error("Failed to delete ledger entry");
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
        setUploadFile(null);
        setIsUploadModalOpen(true);
    };

<<<<<<< HEAD
    // All roles can access ledger (admin, auditor, bank, corporate)
    const canViewLedgers = ["admin", "auditor", "bank", "corporate"].includes(role);

    // Filter ledgers based on user role for stats display
    const getFilteredLedgersForStats = () => {
        if (role === "admin" || role === "auditor") {
            return ledgers; // See all 50
        } else if (role === "bank") {
            return ledgers.filter((l) => l.user_name === "Bank User");
        } else if (role === "corporate") {
            return ledgers.filter((l) => l.user_name === "Corporate User");
        }
        return [];
    };

    const visibleLedgers = getFilteredLedgersForStats();

=======
>>>>>>> e662a5b2cb84393a6f0842d0d1e1e094ed8ecf9e
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
<<<<<<< HEAD
                                    {visibleLedgers.length}
=======
                                    {stats.total}
>>>>>>> e662a5b2cb84393a6f0842d0d1e1e094ed8ecf9e
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
<<<<<<< HEAD
                                    {
                                        visibleLedgers.filter(
                                            (l) =>
                                                new Date(l.created_at) >
                                                new Date(
                                                    Date.now() - 86400000
                                                )
                                        ).length
                                    }
=======
                                    {stats.recent}
>>>>>>> e662a5b2cb84393a6f0842d0d1e1e094ed8ecf9e
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
<<<<<<< HEAD
                                    {
                                        new Set(visibleLedgers.map((l) => l.user_name))
                                            .size
                                    }
=======
                                    {stats.users}
>>>>>>> e662a5b2cb84393a6f0842d0d1e1e094ed8ecf9e
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
                    setUploadFile(null);
                }}
                onSubmit={handleUploadSubmit}
                uploadFile={uploadFile}
                onFileChange={setUploadFile}
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
