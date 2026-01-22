/**
 * API Service Layer
 * Centralized API calls for all backend endpoints
 */
import api from "./axios";
import { toast } from "react-hot-toast";

/* ================= ERROR HANDLING ================= */

/**
 * Extracts a user-friendly error message from API errors
 * @param {Error} error - The error object from axios
 * @param {string} fallbackMessage - Default message if extraction fails
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, fallbackMessage = "An error occurred") => {
    if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        // Handle FastAPI validation errors (array of errors)
        if (Array.isArray(detail)) {
            return detail.map(e => e.msg || e.message).join(", ");
        }
        return detail;
    }
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message) {
        return error.message;
    }
    return fallbackMessage;
};

/**
 * Shows error toast with consistent formatting
 * @param {Error} error - The error object
 * @param {string} fallbackMessage - Default message
 */
export const showErrorToast = (error, fallbackMessage = "An error occurred") => {
    toast.error(getErrorMessage(error, fallbackMessage));
};

/**
 * Shows success toast with consistent formatting
 * @param {string} message - Success message
 */
export const showSuccessToast = (message) => {
    toast.success(message);
};

/* ================= AUTH SERVICES ================= */

export const authService = {
    /**
     * Login user with email and password
     */
    login: async (email, password) => {
        const response = await api.post("/api/auth/login", { email, password });
        return response.data;
    },

    /**
     * Register new user
     */
    register: async (userData) => {
        const response = await api.post("/api/auth/register", userData);
        return response.data;
    },

    /**
     * Get current user profile
     */
    getMe: async () => {
        const response = await api.get("/api/auth/me");
        return response.data;
    },

    /**
     * Logout user
     */
    logout: async () => {
        const response = await api.post("/api/auth/logout");
        return response.data;
    },

    /**
     * Check if email exists
     */
    checkEmail: async (email) => {
        const response = await api.get(`/api/auth/check-email?email=${email}`);
        return response.data;
    },

    /**
     * Get all users (admin/auditor only)
     */
    getAllUsers: async () => {
        const response = await api.get("/api/auth/users");
        return response.data;
    },

    /**
     * Initiate forgot password
     */
    forgotPassword: async (email) => {
        const response = await api.post("/api/auth/forgotpassword", { email });
        return response.data;
    },

    /**
     * Verify OTP
     */
    verifyOtp: async (email, otp) => {
        const response = await api.post(
            `/api/auth/verify-otp?email=${email}&otp=${otp}`
        );
        return response.data;
    },

    /**
     * Reset password
     */
    resetPassword: async (email, newPassword) => {
        const response = await api.post(
            `/api/auth/reset-password?email=${email}&new_password=${newPassword}`
        );
        return response.data;
    },
};

/* ================= TRADE CHAIN (DOCUMENTS) SERVICES ================= */

export const tradeChainService = {
    /**
     * Upload single or multiple documents
     */
    uploadDocuments: async (files, docType, issuedAt) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("doc_type", docType);
        formData.append("issued_at", new Date(issuedAt).toISOString());

        const response = await api.post("/api/trade_chain/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    /**
     * Get documents for current user (bank/corporate)
     */
    getMyDocuments: async () => {
        const response = await api.get("/api/trade_chain/document");
        return response.data;
    },

    /**
     * Get all documents for all users (admin/auditor)
     */
    getAllDocuments: async () => {
        const response = await api.get("/api/trade_chain/documents");
        return response.data;
    },

    /**
     * Update a document (admin/auditor)
     */
    updateDocument: async (documentId, file, docType) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("doc_type", docType);

        const response = await api.put(
            `/api/trade_chain/document/${documentId}`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data;
    },

    /**
     * Delete a document (admin/auditor)
     */
    deleteDocument: async (documentId) => {
        await api.delete(`/api/trade_chain/document/${documentId}`);
    },
};

/* ================= LEDGER SERVICES ================= */

export const ledgerService = {
    /**
     * Create a new ledger entry
     */
    createEntry: async (documentId, action, metadata = {}) => {
        const response = await api.post("/api/ledger/entry", {
            document_id: documentId,
            action,
            metadatav: metadata,
        });
        return response.data;
    },

    /**
     * Get all ledger records (admin/auditor)
     */
    getAllRecords: async (params = {}) => {
        const response = await api.get("/api/ledger/records/admin", { params });
        return response.data;
    },

    /**
     * Get user's ledger records (bank/corporate)
     */
    getMyRecords: async (params = {}) => {
        const response = await api.get("/api/ledger/records/user", { params });
        return response.data;
    },

    /**
     * Delete a ledger record (admin/auditor)
     */
    deleteRecord: async (recordId) => {
        await api.delete(`/api/ledger/records/${recordId}`);
    },

    /**
     * Update ledger record action (admin/auditor)
     */
    updateRecord: async (recordId, action) => {
        const formData = new FormData();
        formData.append("action", action);

        const response = await api.patch(
            `/api/ledger/records/${recordId}`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return response.data;
    },
};

/* ================= RISK SCORES SERVICES ================= */

export const riskScoresService = {
    /**
     * Create a new risk score (admin/auditor)
     */
    create: async (userId, score, rationale) => {
        const response = await api.post("/api/risk_scores/", {
            user_id: userId,
            score,
            rationale,
        });
        return response.data;
    },

    /**
     * Get current user's risk scores
     */
    getMyScores: async () => {
        const response = await api.get("/api/risk_scores/my");
        return response.data;
    },

    /**
     * Get all risk scores with optional filters (admin/auditor)
     * @param {Object} filters - Optional filters
     * @param {string} filters.search - Search by user name or rationale
     * @param {number} filters.minScore - Minimum score filter
     * @param {number} filters.maxScore - Maximum score filter
     * @param {number} filters.userId - Filter by specific user ID
     */
    getAll: async (filters = {}) => {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.minScore !== undefined) params.min_score = filters.minScore;
        if (filters.maxScore !== undefined) params.max_score = filters.maxScore;
        if (filters.userId) params.user_id = filters.userId;

        const response = await api.get("/api/risk_scores/", { params });
        return response.data;
    },

    /**
     * Update a risk score (admin/auditor)
     */
    update: async (riskId, score, rationale) => {
        const response = await api.patch(`/api/risk_scores/${riskId}`, {
            score,
            rationale,
        });
        return response.data;
    },

    /**
     * Delete a risk score (admin/auditor)
     */
    delete: async (riskId) => {
        await api.delete(`/api/risk_scores/${riskId}`);
    },
};

/* ================= AUDIT LOGS SERVICES ================= */

export const auditLogsService = {
    /**
     * Create a new audit log (admin only)
     */
    create: async (action, targetType, targetId) => {
        const response = await api.post("/api/audit_logs/", {
            action,
            target_type: targetType,
            target_id: targetId,
        });
        return response.data;
    },

    /**
     * Get all audit logs with optional filters (admin/auditor)
     * @param {Object} filters - Optional filters
     * @param {string} filters.search - Search by admin name or target
     * @param {string} filters.action - Filter by action type
     * @param {string} filters.targetType - Filter by target type
     */
    getAll: async (filters = {}) => {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.action) params.action = filters.action;
        if (filters.targetType) params.target_type = filters.targetType;

        const response = await api.get("/api/audit_logs/", { params });
        return response.data;
    },

    /**
     * Get current admin's audit logs
     */
    getMyLogs: async () => {
        const response = await api.get("/api/audit_logs/my");
        return response.data;
    },
};

/* ================= TRADE TRANSACTIONS SERVICES ================= */

export const transactionsService = {
    /**
     * Create a new trade transaction (bank/corporate)
     */
    create: async (buyerId, sellerId, amount, currency, status = "pending") => {
        const response = await api.post("/api/transaction/", {
            buyer_id: buyerId,
            seller_id: sellerId,
            amount: parseFloat(amount),
            currency: currency.toUpperCase(),
            status,
        });
        return response.data;
    },

    /**
     * Get a specific transaction
     */
    getById: async (transactionId) => {
        const response = await api.get(`/api/transaction/${transactionId}`);
        return response.data;
    },

    /**
     * Get all transactions with optional filters
     */
    getAll: async (skip = 0, limit = 100, filters = {}) => {
        const params = { skip, limit };
        if (filters.status) params.status = filters.status;
        if (filters.search) params.search = filters.search;
        if (filters.buyerId) params.buyer_id = filters.buyerId;
        if (filters.sellerId) params.seller_id = filters.sellerId;

        const response = await api.get("/api/transaction/", { params });
        return response.data;
    },

    /**
     * Get transactions for a specific user
     */
    getByUser: async (userId, skip = 0, limit = 100) => {
        const response = await api.get(`/api/transaction/user/${userId}`, {
            params: { skip, limit },
        });
        return response.data;
    },

    /**
     * Update transaction status (bank/corporate/admin)
     */
    updateStatus: async (transactionId, status) => {
        const response = await api.patch(
            `/api/transaction/${transactionId}/status`,
            { status }
        );
        return response.data;
    },

    /**
     * Delete a transaction (admin only)
     */
    delete: async (transactionId) => {
        await api.delete(`/api/transaction/${transactionId}`);
    },
};

export default {
    auth: authService,
    tradeChain: tradeChainService,
    ledger: ledgerService,
    riskScores: riskScoresService,
    auditLogs: auditLogsService,
    transactions: transactionsService,
};
