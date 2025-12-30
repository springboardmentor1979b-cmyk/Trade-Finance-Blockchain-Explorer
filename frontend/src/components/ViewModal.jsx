import React from "react";
import {
    FileText,
    Download,
    Edit3,
    XCircle,
    CreditCard,
    Ship,
    FileBox,
    FileCheck,
    Shield,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircleIcon,
    Activity,
    Users,
} from "lucide-react";

// Document type icons mapping
const documentIcons = {
    loc: CreditCard,
    invoice: FileText,
    bill_of_lading: Ship,
    po: FileBox,
    coo: FileCheck,
    insurance_cert: Shield,
};

// Status badge styles
const statusStyles = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
    in_progress: { bg: "bg-blue-100", text: "text-blue-800", icon: Activity },
    completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle,
    },
    disputed: { bg: "bg-red-100", text: "text-red-800", icon: XCircleIcon },
    verified: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        icon: CheckCircle,
    },
};

/**
 * ViewModal Component
 * Modal for viewing document details
 * Supports role-based action rendering:
 * - Admin: Can view and edit
 * - Corporate/Bank: Can only view and download
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Object|null} props.document - Document object to display
 * @param {Function} props.onClose - Callback when modal should close
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDownload - Callback when download button is clicked
 * @param {string} props.userRole - Current user's role (admin, corporate, bank)
 *
 * @example
 * <ViewModal
 *   isOpen={showModal}
 *   document={selectedDoc}
 *   onClose={() => setShowModal(false)}
 *   onEdit={handleEdit}
 *   onDownload={handleDownload}
 *   userRole="admin"
 * />
 */
function ViewModal({
    isOpen,
    document,
    onClose,
    onEdit,
    onDownload,
    userRole = "corporate",
}) {
    if (!isOpen || !document) return null;

    const canEdit = userRole === "admin";
    const canDownload = userRole !== "admin"; // Banks and corporates can download

    const DocIcon = documentIcons[document.type] || FileText;
    const status = statusStyles[document.status];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Document Details
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Blockchain verified document information
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg"
                    >
                        <XCircle className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Document Preview */}
                    <div className="bg-slate-900 rounded-xl p-8 flex items-center justify-center">
                        <DocIcon className="w-20 h-20 text-blue-400" />
                    </div>

                    {/* Document Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-slate-400 text-sm">
                                Document Name
                            </p>
                            <p className="text-white font-medium mt-1">
                                {document.name}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-slate-400 text-sm">
                                Document Type
                            </p>
                            <p className="text-white font-medium mt-1 capitalize">
                                {document.type.replace(/_/g, " ")}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-slate-400 text-sm">Status</p>
                            <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-1 ${status?.bg} ${status?.text}`}
                            >
                                {document.status.replace(/_/g, " ")}
                            </span>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-slate-400 text-sm">File Size</p>
                            <p className="text-white font-medium mt-1">
                                {document.size}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-slate-400 text-sm">
                                Uploaded By
                            </p>
                            <p className="text-white font-medium mt-1">
                                {document.uploadedBy}
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-slate-400 text-sm">
                                Upload Date
                            </p>
                            <p className="text-white font-medium mt-1">
                                {document.uploadedAt}
                            </p>
                        </div>
                    </div>

                    {/* Blockchain Info */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm font-medium mb-2">
                            Blockchain Transaction
                        </p>
                        <code className="text-blue-300 font-mono text-sm break-all">
                            {document.txHash}
                        </code>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {canDownload && (
                            <button
                                onClick={() =>
                                    onDownload && onDownload(document)
                                }
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        )}
                        {canEdit && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onEdit(document);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-medium transition-colors"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit
                            </button>
                        )}
                        {!canDownload && !canEdit && (
                            <button
                                onClick={onClose}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewModal;
