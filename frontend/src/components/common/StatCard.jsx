import React from 'react';

const StatCard = ({ label, value, color = 'gray', icon }) => {
    const colorClasses = {
        gray: 'text-white',
        emerald: 'text-emerald-400',
        blue: 'text-blue-400',
        yellow: 'text-yellow-400',
        red: 'text-red-400'
    };

    const borderClasses = {
        gray: 'group-hover:border-gray-600',
        emerald: 'group-hover:border-emerald-600/50',
        blue: 'group-hover:border-blue-600/50',
        yellow: 'group-hover:border-yellow-600/50',
        red: 'group-hover:border-red-600/50'
    };

    return (
        <div className={`stat-card card-hover group ${borderClasses[color]}`}>
            <p className="text-gray-400 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
                {icon} {label}
            </p>
            <p className={`text-2xl font-bold ${colorClasses[color]} group-hover:scale-105 transition-transform`}>
                {value}
            </p>
        </div>
    );
};

export default StatCard;
