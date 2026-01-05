import { useState, useCallback } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

/**
 * Custom hook for document management
 * Handles document state, filtering, and CRUD operations
 *
 * @param {Array} initialDocuments - Initial documents array
 * @returns {Object} Document management functions and state
 */
export const useDocuments = (initialDocuments = []) => {
    const [documents, setDocuments] = useState(initialDocuments);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const fetchDocuments = useCallback(async (role) => {
        setLoading(true);
        try {
            const endpoint =
                role === "admin" || role === "auditor"
                    ? "/api/trade_chain/documents"
                    : "/api/trade_chain/document";
            const response = await api.get(endpoint);
            
            // Transform data if needed based on role
            // Admin/Auditor gets UserDocumentsResponse list, others get Documents list
            let docs = [];
            if (role === "admin" || role === "auditor") {
                // Flatten the structure for the table if needed, or handle it in the component
                // For now, let's assume we want a flat list of documents with owner info
                docs = response.data.flatMap(userDocs => 
                    userDocs.documents.map(doc => ({
                        ...doc,
                        ownerName: userDocs.name,
                        ownerEmail: userDocs.email
                    }))
                );
            } else {
                docs = response.data;
            }
            
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
            toast.error("Failed to load documents");
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
            await api.delete(`/api/trade_chain/document/${docId}`);
            setDocuments((prev) => prev.filter((d) => d.id !== docId));
            toast.success("Document deleted successfully");
        } catch (error) {
            console.error("Failed to delete document:", error);
            toast.error("Failed to delete document");
        }
    };

    return {
        documents,
        setDocuments,
        loading,
        fetchDocuments,
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
