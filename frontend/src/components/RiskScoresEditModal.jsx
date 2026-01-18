import React from "react";
import { X } from "lucide-react";

function RiskScoresEditModal({
    isOpen,
    riskScore,
    formData,
    onFormChange,
    onClose,
    onSubmit,
}) {
    if (!isOpen || !riskScore) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-white/10 max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Edit Risk Score</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">User</p>
                    <p className="text-white font-medium">{riskScore.user_name}</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Risk Score (0-100)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.score}
                            onChange={(e) =>
                                onFormChange({
                                    ...formData,
                                    score: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Rationale
                        </label>
                        <textarea
                            value={formData.rationale}
                            onChange={(e) =>
                                onFormChange({
                                    ...formData,
                                    rationale: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows="3"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RiskScoresEditModal;
