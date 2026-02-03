import { useState, useCallback } from "react";
import { tradeChainService, showSuccessToast, showErrorToast } from "../api/services";

/**
 * Custom hook for document management
 * Handles document state, filtering, and CRUD operations with backend pagination
 *
 * @param {Array} initialDocuments - Initial documents array
 * @returns {Object} Document management functions and state
 */
export const useDocuments = (initialDocuments = []) => {
    const [documents, setDocuments] = useState(initialDocuments);
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    const fetchDocuments = useCallback(async (role, skip = 0, limit = 25) => {
        setLoading(true);
        try {
            let response;
            if (role === "admin" || role === "auditor") {
                response = await tradeChainService.getAllDocuments(skip, limit);
            } else {
                response = await tradeChainService.getMyDocuments(skip, limit);
            }
            // Response format: { total, documents, skip, limit }
            setDocuments(response.documents || []);
            setTotalDocuments(response.total || 0);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
            showErrorToast(error, "Failed to load documents");
            setDocuments([]);
            setTotalDocuments(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const addDocument = (newDoc) => {
        setDocuments((prev) => [newDoc, ...prev]);
    };

    const updateDocument = (docId, updatedData) => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === docId ? { ...doc, ...updatedData } : doc
            )
        );
    };

    const deleteDocument = async (docId) => {
        try {
            await tradeChainService.deleteDocument(docId);
            setDocuments((prev) => prev.filter((d) => d.id !== docId));
            showSuccessToast("Document deleted successfully");
        } catch (error) {
            console.error("Failed to delete document:", error);
            showErrorToast(error, "Failed to delete document");
        }
    };

    return {
        documents,
        setDocuments,
        totalDocuments,
        loading,
        fetchDocuments,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        filterStatus,
        setFilterStatus,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        addDocument,
        updateDocument,
        deleteDocument,
    };
};

/**
 * Custom hook for upload form management
 * Handles file state and form data
 *
 * @param {Object} initialForm - Initial form state
 * @returns {Object} Form management functions and state
 *
 * @example
 * const {
 *   uploadFile,
 *   setUploadFile,
 *   uploadForm,
 *   setUploadForm,
 *   resetForm,
 *   dragActive,
 *   setDragActive,
 * } = useUploadForm({ name: "", type: "loc", description: "" });
 */
export const useUploadForm = (initialForm) => {
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadForm, setUploadForm] = useState(initialForm);
    const [dragActive, setDragActive] = useState(false);

    const resetForm = () => {
        setUploadFile(null);
        setUploadForm(initialForm);
        setDragActive(false);
    };

    return {
        uploadFile,
        setUploadFile,
        uploadForm,
        setUploadForm,
        resetForm,
        dragActive,
        setDragActive,
    };
};

/**
 * Custom hook for modal management
 * Handles modal visibility states
 *
 * @returns {Object} Modal state and control functions
 *
 * @example
 * const { showUploadModal, toggleUploadModal, ... } = useModals();
 */
export const useModals = () => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const closeAllModals = () => {
        setShowUploadModal(false);
        setShowViewModal(false);
        setShowEditModal(false);
        setSelectedDocument(null);
    };

    return {
        showUploadModal,
        setShowUploadModal,
        showViewModal,
        setShowViewModal,
        showEditModal,
        setShowEditModal,
        selectedDocument,
        setSelectedDocument,
        closeAllModals,
    };
};
