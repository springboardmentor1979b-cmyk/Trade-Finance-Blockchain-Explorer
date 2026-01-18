import React, { useState } from "react";
import {
    ArrowLeft,
    TrendingUp,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import RiskScoresTable from "./RiskScoresTable";
import RiskScoresActionBar from "./RiskScoresActionBar";
import RiskScoresUploadModal from "./RiskScoresUploadModal";
import RiskScoresEditModal from "./RiskScoresEditModal";
import RiskScoresViewModal from "./RiskScoresViewModal";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

function RiskScoresPage({ onClose }) {
    const { role } = useAuth();

    // Generate 50 sample risk scores
    const generateSampleRiskScores = () => {
        const users = ["Bank User", "Corporate User"];
        const categories = ["Credit Risk", "Operational Risk", "Market Risk", "Compliance Risk"];

        return Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            user_id: (i % 2) + 1,
            user_name: users[i % 2],
            score: Math.floor(Math.random() * 100),
            category: categories[i % categories.length],
            rationale: `Risk assessment for ${users[i % 2]}`,
            last_updated: new Date(
                Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
            ).toISOString(),
        }));
    };

    const [riskScores, setRiskScores] = useState(generateSampleRiskScores());
    const [searchQuery, setSearchQuery] = useState("");
    const [filterUser, setFilterUser] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRiskScore, setSelectedRiskScore] = useState(null);

    const [uploadForm, setUploadForm] = useState({
        user_name: "",
        score: "",
        rationale: "",
    });
    const [editForm, setEditForm] = useState({ score: "", rationale: "" });

    const canCreate = role === "auditor";
    const canEdit = role === "auditor";
    const canDelete = role === "auditor";
    const canView = role === "auditor" || role === "bank" || role === "corporate";

    // Filter based on role
    const getVisibleRiskScores = () => {
        if (role === "auditor") {
            return riskScores;
        } else if (role === "bank") {
            return riskScores.filter((r) => r.user_name === "Bank User");
        } else if (role === "corporate") {
            return riskScores.filter((r) => r.user_name === "Corporate User");
        }
        return riskScores;
    };

    if (!canView) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
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
                        Only Auditor, Bank, and Corporate users can view risk scores.
                    </p>
                </div>
            </div>
        );
    }

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!uploadForm.user_name) {
            toast.error("Please select a user");
            return;
        }
        if (!uploadForm.score) {
            toast.error("Please enter a risk score");
            return;
        }

        const newRiskScore = {
            id: riskScores.length + 1,
            user_id: Math.random() * 10,
            user_name: uploadForm.user_name,
            user_type: uploadForm.user_name === "Bank User" ? "Bank" : "Corporate",
            score: parseInt(uploadForm.score),
            category: "Credit Risk",
            rationale: uploadForm.rationale,
            last_updated: new Date().toISOString(),
        };

        setRiskScores([newRiskScore, ...riskScores]);
        toast.success("Risk score created successfully");
        setIsUploadModalOpen(false);
        setUploadForm({ user_name: "", score: "", rationale: "" });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedRiskScore) return;

        if (!editForm.score) {
            toast.error("Please enter a risk score");
            return;
        }

        const updatedRiskScores = riskScores.map((r) =>
            r.id === selectedRiskScore.id
                ? {
                    ...r,
                    score: parseInt(editForm.score),
                    rationale: editForm.rationale,
                    last_updated: new Date().toISOString(),
                }
                : r
        );

        setRiskScores(updatedRiskScores);
        toast.success("Risk score updated successfully");
        setIsEditModalOpen(false);
        setEditForm({ score: "", rationale: "" });
        setSelectedRiskScore(null);
    };

    const handleDelete = (riskScoreId) => {
        if (window.confirm("Are you sure you want to delete this risk score?")) {
            setRiskScores(riskScores.filter((r) => r.id !== riskScoreId));
            toast.success("Risk score deleted successfully");
        }
    };

    const handleView = (riskScore) => {
        setSelectedRiskScore(riskScore);
        setIsViewModalOpen(true);
    };

    const handleEdit = (riskScore) => {
        setSelectedRiskScore(riskScore);
        setEditForm({ score: riskScore.score.toString(), rationale: riskScore.rationale });
        setIsEditModalOpen(true);
    };

    const handleCreateClick = () => {
        setUploadForm({ user_name: "", score: "", rationale: "" });
        setIsUploadModalOpen(true);
    };

    const visibleRiskScores = getVisibleRiskScores();

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
                                    {visibleRiskScores.length}
                                </p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-blue-500/20 text-blue-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    High Risk
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {visibleRiskScores.filter((r) => r.score > 70).length}
                                </p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-red-500/20 text-red-400" />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">
                                    Average Score
                                </p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {(
                                        visibleRiskScores.reduce((sum, r) => sum + r.score, 0) /
                                        visibleRiskScores.length
                                    ).toFixed(1)}
                                </p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500/20 text-green-400" />
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
                />

                {/* Risk Scores Table */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">
                            Risk Score Assessments
                        </h2>
                    </div>
                    <RiskScoresTable
                        riskScores={visibleRiskScores}
                        searchQuery={searchQuery}
                        filterUser={filterUser}
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
            <RiskScoresUploadModal
                isOpen={isUploadModalOpen}
                formData={uploadForm}
                onFormChange={setUploadForm}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({ user_name: "", score: "", rationale: "" });
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
