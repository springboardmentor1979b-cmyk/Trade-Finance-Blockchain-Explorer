import React from "react";
import { XCircle } from "lucide-react";

/**
 * LedgerEditModal Component
 * Modal for editing ledger action (Admin only)
 * Admin can only edit the action field, not other details
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object} props.ledger - Ledger entry to edit
 * @param {Object} props.formData - Current form data
 * @param {Function} props.onFormChange - Callback when form data changes
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onSubmit - Callback when form is submitted
 */
function LedgerEditModal({
    isOpen,
    ledger,
    formData,
    onFormChange,
    onClose,
    onSubmit,
}) {
    if (!isOpen || !ledger) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Edit Ledger Action
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Update the action for this ledger entry
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <XCircle className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    {/* Document Number (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Document Number
                        </label>
                        <input
                            type="text"
                            value={ledger.document_number}
                            readOnly
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed focus:outline-none"
                        />
                        <p className="text-slate-500 text-xs mt-1">
                            Cannot be changed
                        </p>
                    </div>

                    {/* User Name (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            User Name
                        </label>
                        <input
                            type="text"
                            value={ledger.user_name}
                            readOnly
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed focus:outline-none"
                        />
                        <p className="text-slate-500 text-xs mt-1">
                            Cannot be changed
                        </p>
                    </div>

                    {/* Created At (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Created At
                        </label>
                        <input
                            type="text"
                            value={new Date(
                                ledger.created_at
                            ).toLocaleString()}
                            readOnly
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed focus:outline-none"
                        />
                        <p className="text-slate-500 text-xs mt-1">
                            Cannot be changed
                        </p>
                    </div>

                    {/* Action (Editable) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Action *
                        </label>
                        <select
                            value={formData.action || ledger.action}
                            onChange={(e) =>
                                onFormChange({
                                    ...formData,
                                    action: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="" className="bg-slate-800">
                                Select Action
                            </option>
                            <option value="issued" className="bg-slate-800">
                                Issued
                            </option>
                            <option value="amended" className="bg-slate-800">
                                Amended
                            </option>
                            <option value="shipped" className="bg-slate-800">
                                Shipped
                            </option>
                            <option value="received" className="bg-slate-800">
                                Received
                            </option>
                            <option value="paid" className="bg-slate-800">
                                Paid
                            </option>
                            <option value="cancelled" className="bg-slate-800">
                                Cancelled
                            </option>
                            <option value="verified" className="bg-slate-800">
                                Verified
                            </option>
                        </select>
                        <p className="text-slate-500 text-xs mt-1">
                            Only action can be edited. To change other details,
                            delete and recreate the ledger.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                        >
                            Update Action
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LedgerEditModal;
