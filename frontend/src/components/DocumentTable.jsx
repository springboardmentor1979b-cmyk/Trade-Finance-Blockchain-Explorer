import React from "react";
import {
    FileText,
    Eye,
    Edit3,
    Trash2,
    Download,
    Users,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Activity,
    CreditCard,
    Ship,
    FileBox,
    FileCheck,
    Shield,
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
    disputed: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
    verified: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        icon: CheckCircle,
    },
};

/**
 * DocumentTable Component
 * Displays a table of documents with filtering and action buttons
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.documents - Array of document objects to display
 * @param {string} props.searchQuery - Current search query
 * @param {string} props.filterType - Document type filter
 * @param {string} props.filterStatus - Status filter
 * @param {Function} props.onView - Callback when view button is clicked
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 *
 * @example
 * <DocumentTable
 *   documents={docs}
 *   searchQuery={query}
 *   filterType={type}
 *   filterStatus={status}
 *   onView={handleView}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
function DocumentTable({
    documents,
    searchQuery,
    filterType,
    filterStatus,
    onView,
    onEdit,
    onDelete,
}) {
    // Filter documents
    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch = doc.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || doc.type === filterType;
        const matchesStatus =
            filterStatus === "all" || doc.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Document
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Type
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Status
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Uploaded By
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                TX Hash
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Size
                            </th>
                            <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDocuments.map((doc) => {
                            const DocIcon = documentIcons[doc.type] || FileText;
                            const status = statusStyles[doc.status];
                            const StatusIcon = status?.icon || AlertCircle;

                            return (
                                <tr
                                    key={doc.id}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                                <DocIcon className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">
                                                    {doc.name}
                                                </p>
                                                <p className="text-slate-400 text-sm">
                                                    {doc.uploadedAt}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-slate-300 capitalize">
                                            {doc.type.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status?.bg} ${status?.text}`}
                                        >
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {doc.status.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                                                <Users className="w-4 h-4 text-slate-300" />
                                            </div>
                                            <span className="text-slate-300">
                                                {doc.uploadedBy}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <code className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded text-sm font-mono">
                                            {doc.txHash}
                                        </code>
                                    </td>
                                    <td className="py-4 px-6 text-slate-300">
                                        {doc.size}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onView(doc)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(doc)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                title="Edit"
                                            >
                                                <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-yellow-400" />
                                            </button>
                                            <button
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4 text-slate-400 group-hover:text-green-400" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(doc.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredDocuments.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">No documents found</p>
                        <p className="text-slate-500 text-sm mt-1">
                            Try adjusting your search or filters
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DocumentTable;
