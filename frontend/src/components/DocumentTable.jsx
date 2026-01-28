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
    letter_of_credit: CreditCard,
    invoice: FileText,
    bill_of_lading: Ship,
    purchase_order: FileBox,
    certificate_of_origin: FileCheck,
    insurance_certificate: Shield,
};

/**
 * DocumentTable Component
 * Displays a table of documents with filtering and action buttons
 * Supports role-based action rendering:
 * - Admin: Can view, edit, delete all documents
 * - Corporate/Bank: Can only view and download their own documents
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
 * @param {Function} props.onDownload - Callback when download button is clicked
 * @param {string} props.userRole - Current user's role (admin, corporate, bank)
 * @param {string} props.currentUsername - Current user's username for filtering
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
 *   onDownload={handleDownload}
 *   userRole="admin"
 *   currentUsername="john"
 * />
 */
function DocumentTable({
    documents,
    searchQuery,
    filterType,
    onView,
    onEdit,
    onDelete,
    onDownload,
    userRole = "corporate",
    currentUsername = "",
}) {
    const isAdmin = userRole === "admin" || userRole === "auditor";
    const canEdit = isAdmin;
    const canDelete = isAdmin;
    const canDownload = !isAdmin; // Banks and corporates can download
    // Filter documents
    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch = (doc.doc_number || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || doc.doc_type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Document Number
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Type
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Uploaded By
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Hash
                            </th>
                            <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                Issued At
                            </th>
                            <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDocuments.map((doc) => {
                            console.log(doc);
                            const DocIcon =
                                documentIcons[doc.doc_type] || FileText;

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
                                                    {doc.doc_number}
                                                </p>
                                                <p className="text-slate-400 text-sm">
                                                    {new Date(
                                                        doc.created_at,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-slate-300 capitalize">
                                            {(doc.doc_type || "").replace(
                                                /_/g,
                                                " ",
                                            )}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                                                <Users className="w-4 h-4 text-slate-300" />
                                            </div>
                                            {!isAdmin ? (<span className="text-slate-300">
                                                {currentUsername ||
                                                    "Me"}
                                            </span>) : (
                                                <span className="text-slate-300">
                                                    {doc.ownerName ||
                                                        doc.owner_id ||
                                                        "Me"}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <code
                                            className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded text-sm font-mono"
                                            title={doc.hash}
                                        >
                                            {doc.hash
                                                ? `${doc.hash.substring(0, 8)}...`
                                                : "N/A"}
                                        </code>
                                    </td>
                                    <td className="py-4 px-6 text-slate-300">
                                        {new Date(
                                            doc.issued_at,
                                        ).toLocaleDateString()}
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
                                            {canEdit && (
                                                <button
                                                    onClick={() => onEdit(doc)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-yellow-400" />
                                                </button>
                                            )}
                                            {canDownload && (
                                                <button
                                                    onClick={() =>
                                                        onDownload &&
                                                        onDownload(doc)
                                                    }
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4 text-slate-400 group-hover:text-green-400" />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() =>
                                                        onDelete(doc.id)
                                                    }
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                                                </button>
                                            )}
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
