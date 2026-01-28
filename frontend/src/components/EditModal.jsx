import React from "react";

function EditModal({
    isOpen,
    document,
    uploadForm,
    onFormChange,
    onClose,
    onSubmit,
}) {
    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">
                        Edit Document
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Update document type
                    </p>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
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
