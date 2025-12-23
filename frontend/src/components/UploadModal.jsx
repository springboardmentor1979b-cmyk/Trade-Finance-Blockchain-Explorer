import React from "react";
import { Upload, FileText, XCircle, ChevronDown } from "lucide-react";

/**
 * UploadModal Component
 * Modal for uploading documents with drag-and-drop support
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback when modal should close
 * @param {File|null} props.uploadFile - Currently selected file
 * @param {Function} props.onFileChange - Callback when file is selected
 * @param {Object} props.uploadForm - Form state object with name, type, description
 * @param {Function} props.onFormChange - Callback to update form state
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {boolean} props.dragActive - Whether drag-and-drop is active
 * @param {Function} props.onDragEnter - Callback for drag enter
 * @param {Function} props.onDragLeave - Callback for drag leave
 * @param {Function} props.onDragOver - Callback for drag over
 * @param {Function} props.onDrop - Callback for drop
 *
 * @example
 * <UploadModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   uploadFile={file}
 *   onFileChange={handleFileChange}
 *   uploadForm={form}
 *   onFormChange={setUploadForm}
 *   onSubmit={handleSubmit}
 *   dragActive={isDragging}
 *   onDragEnter={handleDrag}
 *   onDragLeave={handleDrag}
 *   onDragOver={handleDrag}
 *   onDrop={handleDrop}
 * />
 */
function UploadModal({
    isOpen,
    onClose,
    uploadFile,
    onFileChange,
    uploadForm,
    onFormChange,
    onSubmit,
    dragActive,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
}) {
    if (!isOpen) return null;

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
                        Upload Document
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Upload a trade finance document to the blockchain
                    </p>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    {/* Drag & Drop Zone */}
                    <div
                        onDragEnter={onDragEnter}
                        onDragLeave={onDragLeave}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                            dragActive
                                ? "border-blue-500 bg-blue-500/10"
                                : uploadFile
                                  ? "border-green-500 bg-green-500/10"
                                  : "border-slate-600 hover:border-slate-500"
                        }`}
                    >
                        {uploadFile ? (
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="w-8 h-8 text-green-400" />
                                <div className="text-left">
                                    <p className="text-white font-medium">
                                        {uploadFile.name}
                                    </p>
                                    <p className="text-slate-400 text-sm">
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
                                    className="ml-4 p-1 hover:bg-white/10 rounded"
                                >
                                    <XCircle className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                <p className="text-white mb-1">
                                    Drag and drop your file here
                                </p>
                                <p className="text-slate-400 text-sm mb-4">
                                    or click to browse
                                </p>
                                <input
                                    type="file"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".pdf,.doc,.docx,.jpg,.png"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    Browse Files
                                </label>
                            </>
                        )}
                    </div>

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
                            placeholder="Enter document name"
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

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={uploadForm.description}
                            onChange={(e) =>
                                onFormChange({
                                    ...uploadForm,
                                    description: e.target.value,
                                })
                            }
                            rows={3}
                            placeholder="Enter document description..."
                            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                            disabled={!uploadFile}
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                        >
                            Upload to Blockchain
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UploadModal;
