import React, { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import RiskScoresTable from "./RiskScoresTable";
import RiskScoresActionBar from "./RiskScoresActionBar";
import RiskScoresUploadModal from "./RiskScoresUploadModal";
import RiskScoresEditModal from "./RiskScoresEditModal";
import RiskScoresViewModal from "./RiskScoresViewModal";
import { useAuth } from "../context/AuthContext";
import {
    riskScoresService,
    authService,
    showSuccessToast,
    showErrorToast,
} from "../api/services";

function RiskScoresPage({ onClose }) {
    const { role } = useAuth();

    // Data states
    const [riskScores, setRiskScores] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [filterUser, setFilterUser] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal states
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRiskScore, setSelectedRiskScore] = useState(null);

    // Form states
    const [uploadForm, setUploadForm] = useState({
        user_id: "",
        user_name: "",
        score: "",
        rationale: "",
    });
    const [editForm, setEditForm] = useState({ score: "", rationale: "" });

    // Role permissions
    const isPrivileged = role === "admin" || role === "auditor";
    const canCreate = isPrivileged;
    const canEdit = isPrivileged;
    const canDelete = isPrivileged;
    const canView =
        role === "auditor" ||
        role === "admin" ||
        role === "bank" ||
        role === "corporate";

    // Fetch risk scores from backend with filters
    const fetchRiskScores = async () => {
        try {
            setLoading(true);
            let data;
            if (isPrivileged) {
                // Build filter object for backend
                const filters = {};
                if (searchQuery.trim()) {
                    filters.search = searchQuery.trim();
                }
                if (filterUser && filterUser !== "all") {
                    filters.userId = filterUser;
                }
                data = await riskScoresService.getAll(filters);
            } else {
                data = await riskScoresService.getMyScores();
            }
            setRiskScores(data || []);
            setCurrentPage(1); // Reset to first page when filters change
        } catch (error) {
            console.error("Failed to fetch risk scores:", error);
            showErrorToast(error, "Failed to fetch risk scores");
        } finally {
            setLoading(false);
        }
    };

    // Fetch users for admin/auditor dropdown
    const fetchUsers = async () => {
        if (!isPrivileged) return;
        try {
            const data = await authService.getAllUsers();
            setUsers(data || []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    // Fetch risk scores when role or filters change
    useEffect(() => {
        fetchRiskScores();
    }, [role, searchQuery, filterUser]);

    // Fetch users on mount for privileged users (for filter dropdown)
    useEffect(() => {
        fetchUsers();
    }, [isPrivileged]);

    useEffect(() => {
        if (isUploadModalOpen) {
            fetchUsers();
        }
    }, [isUploadModalOpen]);

    if (!canView) {
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
                        Only Admin, Auditor, Bank, and Corporate users can view
                        risk scores.
                    </p>
                </div>
            </div>
        );
    }

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadForm.user_id) {
            showErrorToast(
                { message: "Please select a user" },
                "Please select a user",
            );
            return;
        }
        if (!uploadForm.score) {
            showErrorToast(
                { message: "Please enter a risk score" },
                "Please enter a risk score",
            );
            return;
        }

        try {
            await riskScoresService.create(
                parseInt(uploadForm.user_id),
                parseFloat(uploadForm.score),
                uploadForm.rationale || "",
            );
            showSuccessToast("Risk score created successfully");
            setIsUploadModalOpen(false);
            setUploadForm({
                user_id: "",
                user_name: "",
                score: "",
                rationale: "",
            });
            fetchRiskScores();
        } catch (error) {
            console.error("Create risk score error:", error);
            showErrorToast(error, "Failed to create risk score");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRiskScore) return;

        if (!editForm.score) {
            showErrorToast(
                { message: "Please enter a risk score" },
                "Please enter a risk score",
            );
            return;
        }

        try {
            await riskScoresService.update(
                selectedRiskScore.id,
                parseFloat(editForm.score),
                editForm.rationale || "",
            );
            showSuccessToast("Risk score updated successfully");
            setIsEditModalOpen(false);
            setEditForm({ score: "", rationale: "" });
            setSelectedRiskScore(null);
            fetchRiskScores();
        } catch (error) {
            console.error("Update risk score error:", error);
            showErrorToast(error, "Failed to update risk score");
        }
    };

    const handleDelete = async (riskScoreId) => {
        if (
            !window.confirm("Are you sure you want to delete this risk score?")
        ) {
            return;
        }

        try {
            await riskScoresService.delete(riskScoreId);
            showSuccessToast("Risk score deleted successfully");
            fetchRiskScores();
        } catch (error) {
            console.error("Delete risk score error:", error);
            showErrorToast(error, "Failed to delete risk score");
        }
    };

    const handleView = (riskScore) => {
        setSelectedRiskScore(riskScore);
        setIsViewModalOpen(true);
    };

    const handleEdit = (riskScore) => {
        setSelectedRiskScore(riskScore);
        setEditForm({
            score: riskScore.score.toString(),
            rationale: riskScore.rationale,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateClick = () => {
        setUploadForm({ user_id: "", user_name: "", score: "", rationale: "" });
        setIsUploadModalOpen(true);
    };

    // Calculate stats
    const avgScore =
        riskScores.length > 0
            ? (
                  riskScores.reduce((sum, r) => sum + r.score, 0) /
                  riskScores.length
              ).toFixed(1)
            : "0.0";

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
                            Risk Scores
                        </h1>
                        <p className="text-slate-400">
                            Monitor and manage bank risk assessments
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Total Assessments
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {loading ? "..." : riskScores.length}
                                </p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-blue-500/20" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    High Risk
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {loading
                                        ? "..."
                                        : riskScores.filter((r) => r.score > 70)
                                              .length}
                                </p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-red-500/20" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Average Score
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {loading ? "..." : avgScore}
                                </p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500/20" />
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <RiskScoresActionBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filterUser={filterUser}
                    onFilterUserChange={setFilterUser}
                    onCreateClick={handleCreateClick}
                    userRole={role}
                    users={users}
                />

                {/* Risk Scores Table */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">
                            Risk Score Assessments
                        </h2>
                    </div>
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">
                            Loading risk scores...
                        </div>
                    ) : (
                        <RiskScoresTable
                            riskScores={riskScores}
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
            <RiskScoresUploadModal
                isOpen={isUploadModalOpen}
                formData={uploadForm}
                onFormChange={setUploadForm}
                users={users}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({
                        user_id: "",
                        user_name: "",
                        score: "",
                        rationale: "",
                    });
                }}
                onSubmit={handleUploadSubmit}
            />

            <RiskScoresEditModal
                isOpen={isEditModalOpen}
                riskScore={selectedRiskScore}
                formData={editForm}
                onFormChange={setEditForm}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditForm({ score: "", rationale: "" });
                    setSelectedRiskScore(null);
                }}
                onSubmit={handleEditSubmit}
            />

            <RiskScoresViewModal
                isOpen={isViewModalOpen}
                riskScore={selectedRiskScore}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedRiskScore(null);
                }}
            />
        </div>
    );
}

export default RiskScoresPage;
