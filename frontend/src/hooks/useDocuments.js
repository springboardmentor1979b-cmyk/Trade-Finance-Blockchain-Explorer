import { useState } from "react";

/**
 * Custom hook for document management
 * Handles document state, filtering, and CRUD operations
 *
 * @param {Array} initialDocuments - Initial documents array
 * @returns {Object} Document management functions and state
 *
 * @example
 * const {
 *   documents,
 *   setDocuments,
 *   searchQuery,
 *   setSearchQuery,
 *   filterType,
 *   setFilterType,
 *   filterStatus,
 *   setFilterStatus,
 *   addDocument,
 *   updateDocument,
 *   deleteDocument,
 * } = useDocuments(initialDocs);
 */
export const useDocuments = (initialDocuments) => {
    const [documents, setDocuments] = useState(initialDocuments);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const addDocument = (newDoc) => {
        setDocuments([newDoc, ...documents]);
    };

    const updateDocument = (docId, updatedData) => {
        setDocuments(
            documents.map((doc) =>
                doc.id === docId ? { ...doc, ...updatedData } : doc
            )
        );
    };

    const deleteDocument = (docId) => {
        setDocuments(documents.filter((d) => d.id !== docId));
    };

    return {
        documents,
        setDocuments,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        filterStatus,
        setFilterStatus,
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
