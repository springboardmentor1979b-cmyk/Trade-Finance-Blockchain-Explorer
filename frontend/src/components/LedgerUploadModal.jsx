import React from "react";

/**
 * LedgerUploadModal Component
 * Modal for creating a new ledger entry for an existing document
 * Bank and Corporate users can create ledgers
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Object} props.formData - Current form data
 * @param {Function} props.onFormChange - Callback when form data changes
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {Array} props.documents - List of existing documents to select from
 */
function LedgerUploadModal({
    isOpen,
    formData,
    onFormChange,
    onClose,
    onSubmit,
    documents = [],
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">
                        Create New Ledger Entry
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Add a new ledger entry for an existing document
                    </p>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    {/* Document Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Select Document *
                        </label>
                        {documents && documents.length > 0 ? (
                            <select
                                value={formData.document_number || ""}
                                onChange={(e) =>
                                    onFormChange({
                                        ...formData,
                                        document_number: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>option]:text-slate-900"
                            >
                                <option value="">Select a document</option>
                                {documents.map((doc) => (
                                    <option key={doc.id} value={doc.doc_number}>
                                        {doc.doc_number} ({doc.doc_type})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-center py-4 text-slate-400">
                                <p>No documents available.</p>
                                <p className="text-sm mt-1">
                                    Please upload documents first in the Trade
                                    Chain section.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={formData.description || ""}
                            onChange={(e) =>
                                onFormChange({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Enter ledger description..."
                            rows="3"
                            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
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
                            disabled={
                                !formData.document_number ||
                                documents.length === 0
                            }
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                        >
                            Create Ledger Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LedgerUploadModal;
