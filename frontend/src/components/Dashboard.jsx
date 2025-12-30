import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FileText,
    CheckCircle,
    Clock,
    TrendingUp,
    Activity,
    Shield,
    Globe,
    Zap,
    ArrowRight,
    Search,
    Box,
    Users,
    BarChart3,
    Lock,
    RefreshCw,
    ChevronRight,
    ExternalLink,
} from "lucide-react";
import StatsCard from "./StatsCard";

/**
 * Dashboard Component
 * Landing page for the Trade Finance Blockchain Explorer
 * Displays network stats, recent transactions, and key features
 */
function Dashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Simulated network stats - would come from API in production
    const [networkStats, setNetworkStats] = useState({
        totalTransactions: 0,
        activeContracts: 0,
        verifiedDocuments: 0,
        networkNodes: 0,
    });

    // Simulated recent transactions
    const recentTransactions = [
        {
            id: 1,
            hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
            type: "Letter of Credit",
            status: "confirmed",
            timestamp: "2 mins ago",
            value: "$125,000",
        },
        {
            id: 2,
            hash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
            type: "Bill of Lading",
            status: "pending",
            timestamp: "5 mins ago",
            value: "$89,500",
        },
        {
            id: 3,
            hash: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
            type: "Invoice",
            status: "confirmed",
            timestamp: "12 mins ago",
            value: "$45,200",
        },
        {
            id: 4,
            hash: "0x4d5e6f7890abcdef1234567890abcdef12345678",
            type: "Purchase Order",
            status: "confirmed",
            timestamp: "18 mins ago",
            value: "$230,000",
        },
        {
            id: 5,
            hash: "0x5e6f7890abcdef1234567890abcdef1234567890",
            type: "Certificate of Origin",
            status: "processing",
            timestamp: "25 mins ago",
            value: "$67,800",
        },
    ];

    // Simulate loading network stats
    useEffect(() => {
        const timer = setTimeout(() => {
            setNetworkStats({
                totalTransactions: 1284592,
                activeContracts: 3847,
                verifiedDocuments: 28453,
                networkNodes: 156,
            });
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // Handle search - would navigate to search results
        console.log("Searching for:", searchQuery);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "confirmed":
                return "text-green-400 bg-green-400/10";
            case "pending":
                return "text-yellow-400 bg-yellow-400/10";
            case "processing":
                return "text-blue-400 bg-blue-400/10";
            default:
                return "text-slate-400 bg-slate-400/10";
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat().format(num);
    };

    const truncateHash = (hash) => {
        return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
    };

    return (
        <div className="min-h-full">
            {/* Hero Section */}
            <section className="relative py-12 px-4 text-center">
                <div className="absolute inset-0 bg-linear-to-b from-orange-500/10 to-transparent rounded-3xl"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Box className="w-10 h-10 text-orange-400" />
                        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
                            Trade Finance Explorer
                        </h1>
                    </div>
                    <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                        Explore, verify, and track trade finance documents on
                        the blockchain. Transparent, secure, and immutable.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by transaction hash, document ID, or address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-32 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Network Stats */}
            <section className="py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-400" />
                        Network Overview
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard
                            label="Total Transactions"
                            value={
                                isLoading
                                    ? "..."
                                    : formatNumber(
                                          networkStats.totalTransactions
                                      )
                            }
                            icon={TrendingUp}
                            color="bg-blue-500"
                        />
                        <StatsCard
                            label="Active Smart Contracts"
                            value={
                                isLoading
                                    ? "..."
                                    : formatNumber(networkStats.activeContracts)
                            }
                            icon={FileText}
                            color="bg-purple-500"
                        />
                        <StatsCard
                            label="Verified Documents"
                            value={
                                isLoading
                                    ? "..."
                                    : formatNumber(
                                          networkStats.verifiedDocuments
                                      )
                            }
                            icon={CheckCircle}
                            color="bg-green-500"
                        />
                        <StatsCard
                            label="Network Nodes"
                            value={
                                isLoading
                                    ? "..."
                                    : formatNumber(networkStats.networkNodes)
                            }
                            icon={Globe}
                            color="bg-orange-500"
                        />
                    </div>
                </div>
            </section>

            {/* Recent Transactions */}
            <section className="py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-400" />
                            Recent Transactions
                        </h2>
                        <button className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors text-sm">
                            View All <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                            Transaction Hash
                                        </th>
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                            Document Type
                                        </th>
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                            Value
                                        </th>
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                            Status
                                        </th>
                                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">
                                            Time
                                        </th>
                                        <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <code className="text-orange-400 text-sm font-mono">
                                                    {truncateHash(tx.hash)}
                                                </code>
                                            </td>
                                            <td className="py-4 px-6 text-white text-sm">
                                                {tx.type}
                                            </td>
                                            <td className="py-4 px-6 text-white text-sm font-medium">
                                                {tx.value}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(tx.status)}`}
                                                >
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-slate-400 text-sm">
                                                {tx.timestamp}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="text-slate-400 hover:text-orange-400 transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-white text-center mb-10">
                        Why Use Our Blockchain Explorer?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Immutable Records
                            </h3>
                            <p className="text-slate-400 text-sm">
                                All trade documents are cryptographically
                                secured and stored on the blockchain, ensuring
                                tamper-proof records.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Real-time Verification
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Instantly verify the authenticity of letters of
                                credit, invoices, and bills of lading with
                                blockchain proof.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Multi-party Trust
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Banks, exporters, importers, and logistics
                                providers can all verify documents from a single
                                source of truth.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-6 h-6 text-orange-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Complete Transparency
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Track the full lifecycle of trade finance
                                documents from creation to settlement with
                                complete audit trails.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Lock className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Secure Access Control
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Role-based permissions ensure only authorized
                                parties can view sensitive document details and
                                transaction data.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <RefreshCw className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Automated Workflows
                            </h3>
                            <p className="text-slate-400 text-sm">
                                Smart contracts automate document verification
                                and approval workflows, reducing processing time
                                significantly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-linear-to-r from-orange-500/15 via-orange-500/10 to-orange-500/5 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/10 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                            Create an account to upload documents, verify
                            transactions, and access the full power of
                            blockchain-based trade finance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/signup"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
                            >
                                Create Account
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;
