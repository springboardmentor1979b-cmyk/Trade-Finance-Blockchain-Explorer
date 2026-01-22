import React from "react";
import { X } from "lucide-react";

function TradeTransactionsUploadModal({
    isOpen,
    formData,
    onFormChange,
    onClose,
    onSubmit,
    users = [],
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-white/10 max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                        Create Trade Transaction
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Buyer
                        </label>
                        <select
                            value={formData.buyer_id}
                            onChange={(e) =>
                                onFormChange({
                                    ...formData,
                                    buyer_id: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" className="bg-slate-800">
                                Select Buyer
                            </option>
                            {users.map((user) => (
                                <option
                                    key={user.id}
                                    value={user.id}
                                    className="bg-slate-800"
                                >
                                    {user.name} ({user.email}) - {user.role}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Seller
                        </label>
                        <select
                            value={formData.seller_id}
                            onChange={(e) =>
                                onFormChange({
                                    ...formData,
                                    seller_id: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" className="bg-slate-800">
                                Select Seller
                            </option>
                            {users
                                .filter(
                                    (u) =>
                                        u.id.toString() !== formData.buyer_id,
                                )
                                .map((user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                        className="bg-slate-800"
                                    >
                                        {user.name} ({user.email}) - {user.role}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formData.amount}
                            onChange={(e) =>
                                onFormChange({
                                    ...formData,
                                    amount: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter amount"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Currency
                        </label>
                        <select
                            value={formData.currency}
                            onChange={(e) =>
                                onFormChange({
                                    ...formData,
                                    currency: e.target.value,
                                })
                            }
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="USD" className="bg-slate-800">
                                USD
                            </option>
                            <option value="EUR" className="bg-slate-800">
                                EUR
                            </option>
                            <option value="GBP" className="bg-slate-800">
                                GBP
                            </option>
                            <option value="JPY" className="bg-slate-800">
                                JPY
                            </option>
                            <option value="INR" className="bg-slate-800">
                                INR
                            </option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TradeTransactionsUploadModal;
