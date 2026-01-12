import React from "react";
import { XCircle, FileText, Users, Calendar, Tag } from "lucide-react";

/**
 * LedgerViewModal Component
 * Modal for viewing ledger entry details
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object} props.ledger - Ledger entry to view
 * @param {Function} props.onClose - Callback when modal is closed
 */
function LedgerViewModal({ isOpen, ledger, onClose }) {
    if (!isOpen || !ledger) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Ledger Entry Details
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            View complete information about this ledger entry
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <XCircle className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Document Number */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <label className="text-sm font-medium text-slate-300">
                                Document Number
                            </label>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                            <p className="text-white font-medium">
                                {ledger.document_number}
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                                ID: {ledger.id}
                            </p>
                        </div>
                    </div>

                    {/* Action */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Tag className="w-4 h-4 text-yellow-400" />
                            <label className="text-sm font-medium text-slate-300">
                                Action
                            </label>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 capitalize">
                                {ledger.action}
                            </span>
                        </div>
                    </div>

                    {/* User Name */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-green-400" />
                            <label className="text-sm font-medium text-slate-300">
                                User Name
                            </label>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                            <p className="text-white font-medium">
                                {ledger.user_name}
                            </p>
                        </div>
                    </div>

                    {/* Created At */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <label className="text-sm font-medium text-slate-300">
                                Created At
                            </label>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                            <p className="text-white font-medium">
                                {new Date(ledger.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    {ledger.description && (
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Description
                            </label>
                            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                                <p className="text-slate-300">
                                    {ledger.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Close Button */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LedgerViewModal;
