import React, { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import TradeTransactionsTable from "./TradeTransactionsTable";
import TradeTransactionsActionBar from "./TradeTransactionsActionBar";
import TradeTransactionsUploadModal from "./TradeTransactionsUploadModal";
import TradeTransactionsEditModal from "./TradeTransactionsEditModal";
import TradeTransactionsViewModal from "./TradeTransactionsViewModal";
import { useAuth } from "../context/AuthContext";
import {
    transactionsService,
    authService,
    showSuccessToast,
    showErrorToast,
} from "../api/services";

function TradeTransactionsPage({ onClose }) {
    const { role, user } = useAuth();

    // Data states
    const [transactions, setTransactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterBuyer, setFilterBuyer] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Form states
    const [uploadForm, setUploadForm] = useState({
        buyer_id: "",
        seller_id: "",
        amount: "",
        currency: "USD",
    });
    const [editForm, setEditForm] = useState({ status: "" });

    // Role permissions
    const isPrivileged = role === "admin" || role === "auditor";
    const canCreate = role === "bank" || role === "corporate";
    const canEdit = role === "admin" || role === "bank" || role === "corporate";
    const canDelete = role === "admin";

    // Fetch transactions from backend with filters
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            // Build filters object
            const filters = {};
            if (filterStatus !== "all") filters.status = filterStatus;
            if (searchQuery.trim()) filters.search = searchQuery.trim();
            if (filterBuyer !== "all") filters.buyerId = filterBuyer;

            const data = await transactionsService.getAll(0, 1000, filters);
            // Transform response to match UI expectations
            const txns = data.transactions || [];
            setTransactions(
                txns.map((t) => ({
                    ...t,
                    buyer_name: t.buyer?.name || `User ${t.buyer_id}`,
                    seller_name: t.seller?.name || `User ${t.seller_id}`,
                })),
            );
            setCurrentPage(1); // Reset to first page when filters change
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            showErrorToast(error, "Failed to fetch transactions");
        } finally {
            setLoading(false);
        }
    };

    // Fetch users for buyer/seller selection
    const fetchUsers = async () => {
        try {
            const data = await authService.getAllUsers();
            setUsers(data || []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            // Non-privileged users can't get all users, use empty list
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [filterStatus, searchQuery, filterBuyer]);

    useEffect(() => {
        // Fetch users on mount for filter dropdown and transaction creation
        // All authenticated users can see users list for creating transactions
        fetchUsers();
    }, []);

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadForm.buyer_id) {
            showErrorToast(
                { message: "Please select a buyer" },
                "Please select a buyer",
            );
            return;
        }
        if (!uploadForm.seller_id) {
            showErrorToast(
                { message: "Please select a seller" },
                "Please select a seller",
            );
            return;
        }
        if (uploadForm.buyer_id === uploadForm.seller_id) {
            showErrorToast(
                { message: "Buyer and seller must be different" },
                "Buyer and seller must be different",
            );
            return;
        }
        if (!uploadForm.amount || parseFloat(uploadForm.amount) <= 0) {
            showErrorToast(
                { message: "Please enter a valid amount" },
                "Please enter a valid amount",
            );
            return;
        }

        try {
            await transactionsService.create(
                parseInt(uploadForm.buyer_id),
                parseInt(uploadForm.seller_id),
                uploadForm.amount,
                uploadForm.currency,
            );
            showSuccessToast("Trade transaction created successfully");
            setIsUploadModalOpen(false);
            setUploadForm({
                buyer_id: "",
                seller_id: "",
                amount: "",
                currency: "USD",
            });
            fetchTransactions();
        } catch (error) {
            console.error("Create transaction error:", error);
            showErrorToast(error, "Failed to create transaction");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTransaction) return;

        if (!editForm.status) {
            showErrorToast(
                { message: "Please select a status" },
                "Please select a status",
            );
            return;
        }

        try {
            await transactionsService.updateStatus(
                selectedTransaction.id,
                editForm.status,
            );
            showSuccessToast("Trade transaction updated successfully");
            setIsEditModalOpen(false);
            setEditForm({ status: "" });
            setSelectedTransaction(null);
            fetchTransactions();
        } catch (error) {
            console.error("Update transaction error:", error);
            showErrorToast(error, "Failed to update transaction");
        }
    };

    const handleDelete = async (transactionId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this trade transaction?",
            )
        ) {
            return;
        }

        try {
            await transactionsService.delete(transactionId);
            showSuccessToast("Trade transaction deleted successfully");
            fetchTransactions();
        } catch (error) {
            console.error("Delete transaction error:", error);
            showErrorToast(error, "Failed to delete transaction");
        }
    };

    const handleView = (transaction) => {
        setSelectedTransaction(transaction);
        setIsViewModalOpen(true);
    };

    const handleEdit = (transaction) => {
        setSelectedTransaction(transaction);
        setEditForm({ status: transaction.status });
        setIsEditModalOpen(true);
    };

    const handleCreateClick = () => {
        setUploadForm({
            buyer_id: "",
            seller_id: "",
            amount: "",
            currency: "USD",
        });
        setIsUploadModalOpen(true);
    };

    // Stats calculations
    const completedCount = transactions.filter(
        (t) => t.status === "completed",
    ).length;
    const disputedCount = transactions.filter(
        (t) => t.status === "disputed",
    ).length;

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
                            Trade Transactions
                        </h1>
                        <p className="text-slate-400">
                            Manage trade transaction details and status
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Total Transactions
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {loading ? "..." : transactions.length}
                                </p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-blue-500/20" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Completed
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {loading ? "..." : completedCount}
                                </p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500/20" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Disputed
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {loading ? "..." : disputedCount}
                                </p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-red-500/20" />
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <TradeTransactionsActionBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filterStatus={filterStatus}
                    onFilterStatusChange={setFilterStatus}
                    filterBuyer={filterBuyer}
                    onFilterBuyerChange={setFilterBuyer}
                    onCreateClick={handleCreateClick}
                    userRole={role}
                    users={users}
                />

                {/* Transactions Table */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">
                            Trade Transactions
                        </h2>
                    </div>
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">
                            Loading transactions...
                        </div>
                    ) : (
                        <TradeTransactionsTable
                            transactions={transactions}
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
            <TradeTransactionsUploadModal
                isOpen={isUploadModalOpen}
                formData={uploadForm}
                onFormChange={setUploadForm}
                users={users}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({
                        buyer_id: "",
                        seller_id: "",
                        amount: "",
                        currency: "USD",
                    });
                }}
                onSubmit={handleUploadSubmit}
            />

            <TradeTransactionsEditModal
                isOpen={isEditModalOpen}
                transaction={selectedTransaction}
                formData={editForm}
                onFormChange={setEditForm}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditForm({ status: "" });
                    setSelectedTransaction(null);
                }}
                onSubmit={handleEditSubmit}
            />

            <TradeTransactionsViewModal
                isOpen={isViewModalOpen}
                transaction={selectedTransaction}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedTransaction(null);
                }}
            />
        </div>
    );
}

export default TradeTransactionsPage;
