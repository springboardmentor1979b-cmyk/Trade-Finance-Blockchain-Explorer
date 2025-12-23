import React from "react";
import { XCircle, CheckCircle, Clock, Activity } from "lucide-react";

// Status badge styles
const statusStyles = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
    in_progress: { bg: "bg-blue-100", text: "text-blue-800", icon: Activity },
    completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
    },
    disputed: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    verified: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        icon: CheckCircle,
    },
};

/**
 * EditModal Component
 * Modal for editing document information
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Object|null} props.document - Document object being edited
 * @param {Object} props.uploadForm - Form state with name, type, description
 * @param {Function} props.onFormChange - Callback to update form state
 * @param {Function} props.onClose - Callback when modal should close
 * @param {Function} props.onSubmit - Callback when form is submitted
 *
 * @example
 * <EditModal
 *   isOpen={showModal}
 *   document={selectedDoc}
 *   uploadForm={form}
 *   onFormChange={setUploadForm}
 *   onClose={() => setShowModal(false)}
 *   onSubmit={handleSubmit}
 * />
 */
function EditModal({
    isOpen,
    document,
    uploadForm,
    onFormChange,
    onClose,
    onSubmit,
}) {
    if (!isOpen || !document) return null;

    const status = statusStyles[document.status];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">
                        Edit Document
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Update document information
                    </p>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    {/* Document Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Document Name
                        </label>
                        <input
                            type="text"
                            value={uploadForm.name}
                            onChange={(e) =>
                                onFormChange({
                                    ...uploadForm,
                                    name: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Document Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Document Type
                        </label>
                        <select
                            value={uploadForm.type}
                            onChange={(e) =>
                                onFormChange({
                                    ...uploadForm,
                                    type: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="loc" className="bg-slate-800">
                                Letter of Credit
                            </option>
                            <option value="invoice" className="bg-slate-800">
                                Invoice
                            </option>
                            <option
                                value="bill_of_lading"
                                className="bg-slate-800"
                            >
                                Bill of Lading
                            </option>
                            <option value="po" className="bg-slate-800">
                                Purchase Order
                            </option>
                            <option value="coo" className="bg-slate-800">
                                Certificate of Origin
                            </option>
                            <option
                                value="insurance_cert"
                                className="bg-slate-800"
                            >
                                Insurance Certificate
                            </option>
                        </select>
                    </div>

                    {/* Current Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Current Status
                        </label>
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status?.bg} ${status?.text}`}
                        >
                            {document.status.replace(/_/g, " ")}
                        </span>
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
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditModal;
