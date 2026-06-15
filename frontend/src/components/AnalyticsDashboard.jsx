import React, { useEffect, useState } from 'react';
import { apibaseurl, callApi } from '../lib';
import { AnalyticsIcon } from './Icons';
import './BookingSystem.css';

const AnalyticsDashboard = ({ logout }) => {
    const [appointments, setAppointments] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Calculated stats
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalProviders: 0,
        pendingCount: 0,
        confirmedCount: 0,
        completedCount: 0
    });

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    function loadData() {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        callApi("GET", apibaseurl + "/api/providers", null, null, (provRes) => {
            if (provRes.code === 200) {
                setProviders(provRes.providers);
                
                callApi("GET", apibaseurl + "/api/appointments", null, null, (appRes) => {
                    setLoading(false);
                    if (appRes.code === 200) {
                        setAppointments(appRes.appointments);
                        calculateAnalytics(appRes.appointments, provRes.providers);
                    }
                }, token);
            } else {
                setLoading(false);
            }
        }, token);
    }

    function calculateAnalytics(apps, provs) {
        const total = apps.length;
        const pending = apps.filter(a => a.status === "PENDING").length;
        const confirmed = apps.filter(a => a.status === "CONFIRMED").length;
        const completed = apps.filter(a => a.status === "COMPLETED").length;

        setStats({
            totalBookings: total,
            totalProviders: provs.length,
            pendingCount: pending,
            confirmedCount: confirmed,
            completedCount: completed
        });

        // Group bookings by provider specialization
        const specMap = {};
        apps.forEach(a => {
            if (a.provider) {
                const spec = a.provider.specialization || "General";
                specMap[spec] = (specMap[spec] || 0) + 1;
            }
        });

        // Ensure all specializations from providers are represented
        provs.forEach(p => {
            const spec = p.specialization || "General";
            if (!specMap[spec]) {
                specMap[spec] = 0;
            }
        });

        const dataArray = Object.entries(specMap).map(([name, value]) => ({
            name,
            value
        }));
        setChartData(dataArray);
    }

    // SVG Chart dimensions and rendering math
    const svgWidth = 500;
    const svgHeight = 220;
    const padding = 40;
    const chartWidth = svgWidth - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    const maxValue = Math.max(...chartData.map(d => d.value), 4); // default scale up to 4 bookings min
    
    return (
        <div className="analytics-dashboard">
            <div className="dashboard-title">
                <AnalyticsIcon size={24} /> Analytics & Booking Insights
            </div>

            {loading && <div className="progress" />}

            <div className="stats-grid">
                <div className="glass-panel stat-card">
                    <span className="label">Total Appointments</span>
                    <span className="value">{stats.totalBookings}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="label">Active Providers</span>
                    <span className="value">{stats.totalProviders}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="label">Pending Requests</span>
                    <span className="value" style={{color: 'var(--status-pending)'}}>{stats.pendingCount}</span>
                </div>
                <div className="glass-panel stat-card">
                    <span className="label">Confirmed & Active</span>
                    <span className="value" style={{color: 'var(--status-confirmed)'}}>{stats.confirmedCount}</span>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="glass-panel chart-container">
                    <div style={{fontWeight: '600', marginBottom: '15px', alignSelf: 'flex-start'}}>
                        Bookings by Specialization
                    </div>
                    {chartData.length > 0 ? (
                        <svg className="chart-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary-color)" />
                                    <stop offset="100%" stopColor="var(--secondary-color)" />
                                </linearGradient>
                            </defs>
                            
                            {/* Grid Lines */}
                            <line x1={padding} y1={padding} x2={padding} y2={svgHeight - padding} stroke="var(--glass-border)" strokeWidth="1" />
                            <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="var(--glass-border)" strokeWidth="1" />
                            
                            {/* Bars */}
                            {chartData.map((d, index) => {
                                const barWidth = 45;
                                const spacing = (chartWidth - barWidth * chartData.length) / (chartData.length + 1);
                                const x = padding + spacing + index * (barWidth + spacing);
                                const barHeight = (d.value / maxValue) * chartHeight;
                                const y = svgHeight - padding - barHeight;
                                
                                return (
                                    <g key={d.name}>
                                        <rect 
                                            x={x} 
                                            y={y} 
                                            width={barWidth} 
                                            height={barHeight} 
                                            rx="4"
                                            className="chart-bar"
                                        />
                                        {/* Value Label */}
                                        <text 
                                            x={x + barWidth / 2} 
                                            y={y - 8} 
                                            fill="var(--text-primary)" 
                                            fontSize="11px" 
                                            fontWeight="600"
                                            textAnchor="middle"
                                        >
                                            {d.value}
                                        </text>
                                        {/* Axis Label */}
                                        <text 
                                            x={x + barWidth / 2} 
                                            y={svgHeight - padding + 18} 
                                            fill="var(--text-secondary)" 
                                            fontSize="10px" 
                                            textAnchor="middle"
                                        >
                                            {d.name}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    ) : (
                        <div style={{color: 'var(--text-secondary)'}}>No data available.</div>
                    )}
                </div>

                <div className="glass-panel" style={{padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <div style={{fontWeight: '600'}}>Activity Reports & Summaries</div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px'}}>
                            <span>Average Rating:</span>
                            <strong style={{color: 'gold'}}>★ {(providers.reduce((acc, p) => acc + (p.rating || 5.0), 0) / (providers.length || 1)).toFixed(1)} / 5.0</strong>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px'}}>
                            <span>Completed Bookings:</span>
                            <strong>{stats.completedCount}</strong>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px'}}>
                            <span>Conversion Rate:</span>
                            <strong>
                                {stats.totalBookings > 0 ? ((stats.completedCount / stats.totalBookings) * 100).toFixed(0) : "0"}%
                            </strong>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span>System Load Status:</span>
                            <span className="status-badge status-confirmed">Optimal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
