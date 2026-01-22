import React from "react";
import { X } from "lucide-react";

function RiskScoresViewModal({ isOpen, riskScore, onClose }) {
    if (!isOpen || !riskScore) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-white/10 max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                        Risk Score Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-400">ID</p>
                        <p className="text-white font-medium mt-1">
                            {riskScore.id}
                        </p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-400">User</p>
                        <p className="text-white font-medium mt-1">
                            {riskScore.user_name}
                        </p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-400">Score</p>
                        <p className="text-white font-medium mt-1">
                            {riskScore.score}
                        </p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-400">Rationale</p>
                        <p className="text-white font-medium mt-1">
                            {riskScore.rationale || "-"}
                        </p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-400">Last Updated</p>
                        <p className="text-white font-medium mt-1">
                            {new Date(riskScore.last_updated).toLocaleString()}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mt-4"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RiskScoresViewModal;
