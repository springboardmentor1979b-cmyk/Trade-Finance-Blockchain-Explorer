import React from "react";

/**
 * StatsCard Component
 * Displays a single statistics card with label, value, icon and color
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.label - Label text for the stat
 * @param {number|string} props.value - The stat value to display
 * @param {React.Component} props.icon - Icon component to display
 * @param {string} props.color - Tailwind color class for the icon background (e.g., "bg-blue-500")
 *
 * @example
 * const Icon = CheckCircle;
 * <StatsCard
 *   label="Verified Documents"
 *   value={25}
 *   icon={Icon}
 *   color="bg-green-500"
 * />
 */
function StatsCard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm">{label}</p>
                    <p className="text-3xl font-bold text-white mt-1">
                        {value}
                    </p>
                </div>
                <div className={`${color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}

export default StatsCard;
