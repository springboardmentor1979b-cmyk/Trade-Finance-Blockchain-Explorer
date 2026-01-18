import React from "react";
import { X } from "lucide-react";

function TradeTransactionsViewModal({
    isOpen,
    transaction,
    onClose,
}) {
    if (!isOpen || !transaction) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-white/10 max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Trade Transaction Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-400">ID</p>
                        <p className="text-white font-medium mt-1">{transaction.id}</p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-400">Buyer</p>
                        <p className="text-white font-medium mt-1">{transaction.buyer_name}</p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-400">Seller</p>
                        <p className="text-white font-medium mt-1">{transaction.seller_name}</p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-400">Amount</p>
                        <p className="text-white font-medium mt-1">
                            {transaction.amount} {transaction.currency}
                        </p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-400">Status</p>
                        <p className="text-white font-medium mt-1 capitalize">{transaction.status}</p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-sm text-slate-400">Created</p>
                        <p className="text-white font-medium mt-1">
                            {new Date(transaction.created_at).toLocaleString()}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mt-4"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TradeTransactionsViewModal;
