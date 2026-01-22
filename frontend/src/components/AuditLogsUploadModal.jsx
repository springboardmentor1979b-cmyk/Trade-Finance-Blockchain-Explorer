import React from "react";
import { X } from "lucide-react";

function AuditLogsUploadModal({
    isOpen,
    formData,
    onFormChange,
    onClose,
    onSubmit,
}) {
    if (!isOpen) return null;

    const actions = ["CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "IMPORT"];
    const targets = ["Document", "Ledger", "Transaction", "User", "RiskScore"];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-white/10 max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                        Create Audit Log Entry
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Action
                        </label>
                        <select
                            value={formData.action}
                            onChange={(e) =>
                                onFormChange({
                                    ...formData,
                                    action: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" className="bg-slate-800">
                                Select Action
                            </option>
                            {actions.map((action) => (
                                <option
                                    key={action}
                                    value={action}
                                    className="bg-slate-800"
                                >
                                    {action}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Target Type
                        </label>
                        <select
                            value={formData.target_type}
                            onChange={(e) =>
                                onFormChange({
                                    ...formData,
                                    target_type: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" className="bg-slate-800">
                                Select Target Type
                            </option>
                            {targets.map((target) => (
                                <option
                                    key={target}
                                    value={target}
                                    className="bg-slate-800"
                                >
                                    {target}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Target ID
                        </label>
                        <input
                            type="text"
                            value={formData.target_id}
                            onChange={(e) =>
                                onFormChange({
                                    ...formData,
                                    target_id: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter target ID"
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
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AuditLogsUploadModal;
