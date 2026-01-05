import React from "react";
import { XCircle, Upload, FileText } from "lucide-react";

function EditModal({
    isOpen,
    document,
    uploadForm,
    onFormChange,
    onClose,
    onSubmit,
    uploadFile,
    onFileChange,
}) {
    if (!isOpen || !document) return null;

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileChange(e.target.files[0]);
        }
    };

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
                    {/* File Upload (Required for update) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            New File (Required)
                        </label>
                        <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 text-center hover:border-slate-500 transition-colors">
                            {uploadFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText className="w-6 h-6 text-green-400" />
                                    <div className="text-left overflow-hidden">
                                        <p className="text-white font-medium truncate">
                                            {uploadFile.name}
                                        </p>
                                        <p className="text-slate-400 text-xs">
                                            {(
                                                uploadFile.size /
                                                (1024 * 1024)
                                            ).toFixed(2)}{" "}
                                            MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onFileChange(null)}
                                        className="ml-auto p-1 hover:bg-white/10 rounded"
                                    >
                                        <XCircle className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                        id="edit-file-upload"
                                        accept=".pdf,.doc,.docx,.jpg,.png"
                                    />
                                    <label
                                        htmlFor="edit-file-upload"
                                        className="flex flex-col items-center cursor-pointer"
                                    >
                                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                        <span className="text-blue-400 text-sm font-medium">
                                            Click to upload new file
                                        </span>
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Document Number (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Document Number
                        </label>
                        <input
                            type="text"
                            value={document.doc_number}
                            readOnly
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 cursor-not-allowed focus:outline-none"
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
                            <option
                                value="letter_of_credit"
                                className="bg-slate-800"
                            >
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
                            <option
                                value="purchase_order"
                                className="bg-slate-800"
                            >
                                Purchase Order
                            </option>
                            <option
                                value="certificate_of_origin"
                                className="bg-slate-800"
                            >
                                Certificate of Origin
                            </option>
                            <option
                                value="insurance_certificate"
                                className="bg-slate-800"
                            >
                                Insurance Certificate
                            </option>
                        </select>
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
                            disabled={!uploadFile}
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
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
