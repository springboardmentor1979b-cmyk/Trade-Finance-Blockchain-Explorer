import React, { useState } from "react";
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import TradeTransactionsTable from "./TradeTransactionsTable";
import TradeTransactionsActionBar from "./TradeTransactionsActionBar";
import TradeTransactionsUploadModal from "./TradeTransactionsUploadModal";
import TradeTransactionsEditModal from "./TradeTransactionsEditModal";
import TradeTransactionsViewModal from "./TradeTransactionsViewModal";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

function TradeTransactionsPage({ onClose }) {
    const { role } = useAuth();

    // Generate 50 sample trade transactions
    const generateSampleTransactions = () => {
        const statuses = ["pending", "in_progress", "completed", "disputed"];
        const currencies = ["USD", "EUR", "GBP", "JPY", "INR"];
        const parties = ["Bank User", "Corporate User"];

        return Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            buyer_id: (i % 2) + 1,
            buyer_name: parties[i % 2],
            seller_id: (i % 2) + 3,
            seller_name: parties[(i + 1) % 2],
            amount: (Math.random() * 1000000 + 10000).toFixed(2),
            currency: currencies[i % currencies.length],
            status: statuses[i % statuses.length],
            created_at: new Date(
                Date.now() -
                    Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
            ).toISOString(),
            updated_at: new Date(
                Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
            ).toISOString(),
        }));
    };

    const [transactions, setTransactions] = useState(
        generateSampleTransactions()
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterBuyer, setFilterBuyer] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const [uploadForm, setUploadForm] = useState({
        buyer_name: "",
        seller_name: "",
        amount: "",
        currency: "USD",
    });
    const [editForm, setEditForm] = useState({ status: "" });

    const canCreate = role === "bank";
    const canEdit = role === "admin";
    const canDelete = role === "admin";

    // Filter transactions based on role
    const getVisibleTransactions = () => {
        if (role === "admin" || role === "auditor") {
            return transactions;
        } else if (role === "bank") {
            return transactions.filter(
                (t) =>
                    t.buyer_name === "Bank User" ||
                    t.seller_name === "Bank User"
            );
        } else if (role === "corporate") {
            return transactions.filter(
                (t) =>
                    t.buyer_name === "Corporate User" ||
                    t.seller_name === "Corporate User"
            );
        }
        return transactions;
    };

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!uploadForm.buyer_name) {
            toast.error("Please enter buyer name");
            return;
        }
        if (!uploadForm.seller_name) {
            toast.error("Please enter seller name");
            return;
        }
        if (!uploadForm.amount) {
            toast.error("Please enter amount");
            return;
        }

        const newTransaction = {
            id: transactions.length + 1,
            buyer_id: Math.random() * 10,
            buyer_name: uploadForm.buyer_name,
            seller_id: Math.random() * 10,
            seller_name: uploadForm.seller_name,
            amount: uploadForm.amount,
            currency: uploadForm.currency,
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        setTransactions([newTransaction, ...transactions]);
        toast.success("Trade transaction created successfully");
        setIsUploadModalOpen(false);
        setUploadForm({
            buyer_name: "",
            seller_name: "",
            amount: "",
            currency: "USD",
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedTransaction) return;

        if (!editForm.status) {
            toast.error("Please select a status");
            return;
        }

        const updatedTransactions = transactions.map((t) =>
            t.id === selectedTransaction.id
                ? {
                      ...t,
                      status: editForm.status,
                      updated_at: new Date().toISOString(),
                  }
                : t
        );

        setTransactions(updatedTransactions);
        toast.success("Trade transaction updated successfully");
        setIsEditModalOpen(false);
        setEditForm({ status: "" });
        setSelectedTransaction(null);
    };

    const handleDelete = (transactionId) => {
        if (
            window.confirm(
                "Are you sure you want to delete this trade transaction?"
            )
        ) {
            setTransactions(transactions.filter((t) => t.id !== transactionId));
            toast.success("Trade transaction deleted successfully");
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
            buyer_name: "",
            seller_name: "",
            amount: "",
            currency: "USD",
        });
        setIsUploadModalOpen(true);
    };

    const visibleTransactions = getVisibleTransactions();

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
                                    {visibleTransactions.length}
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
                                    {
                                        visibleTransactions.filter(
                                            (t) => t.status === "completed"
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
                                    Disputed
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {
                                        visibleTransactions.filter(
                                            (t) => t.status === "disputed"
                                        ).length
                                    }
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
                />

                {/* Transactions Table */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">
                            Trade Transactions
                        </h2>
                    </div>
                    <TradeTransactionsTable
                        transactions={visibleTransactions}
                        searchQuery={searchQuery}
                        filterStatus={filterStatus}
                        filterBuyer={filterBuyer}
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
            <TradeTransactionsUploadModal
                isOpen={isUploadModalOpen}
                formData={uploadForm}
                onFormChange={setUploadForm}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({
                        buyer_name: "",
                        seller_name: "",
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
