"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { backendUrl } from "../App" 
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart, 
    Area      
} from 'recharts'; 

// --- CURRENCY FORMATTING (PHP) ---
const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
        return "₱0.00"; 
    }
    return new Intl.NumberFormat('en-PH', { // Philippine Peso
        style: 'currency',
        currency: 'PHP', 
        minimumFractionDigits: 2,
    }).format(numericAmount);
};

// --- CUSTOM TOOLTIP FOR CHARTS ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const revenuePayload = payload.find(p => p.dataKey === 'Revenue');
        
        if (revenuePayload) {
            return (
                <div className="bg-white p-3 border shadow-md rounded-lg">
                    <p className="text-sm text-gray-500 font-medium">{label}</p>
                    <p className="text-lg font-bold text-indigo-600">{`Revenue : ${formatCurrency(revenuePayload.value)}`}</p>
                </div>
            );
        }
        const valuePayload = payload.find(p => p.dataKey === 'value');
        if (valuePayload) {
             return (
                <div className="bg-white p-3 border shadow-md rounded-lg">
                    <p className="text-sm text-gray-500 font-medium">{valuePayload.name}</p>
                    <p className="text-lg font-bold text-gray-800">{`Count : ${valuePayload.value.toLocaleString()}`}</p>
                </div>
            );
        }
    }
    return null;
};

// --- MOCK DATA FOR CHARTS & NEW METRIC (REPLACE WHEN API IS READY) ---
// MOCK DATA for the Area Chart trend
const mockDailyRevenueTrend = [
    { date: 'Oct 1', Revenue: 40000.55 },
    { date: 'Oct 5', Revenue: 30000.23 },
    { date: 'Oct 10', Revenue: 50000.88 },
    { date: 'Oct 15', Revenue: 45000.12 },
    { date: 'Oct 20', Revenue: 60000.77 },
    { date: 'Oct 25', Revenue: 55000.90 },
    { date: 'Oct 30', Revenue: 70000.44 },
];

// --- MAIN COMPONENT ---
const SalesAnalytics = ({ token }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(backendUrl + "/api/analytics/overview", {
                headers: { token },
            });

            if (response.data.success) {
                setAnalyticsData({
                    ...response.data.data,
                    // Temporarily add mock data for charts and the new metric
                    dailyRevenueTrend: mockDailyRevenueTrend,
                    // ** NEW MOCK METRIC: Assume 15,250 units sold **
                    totalUnitsSold: response.data.data.totalUnitsSold || 15250 
                });
            } else {
                toast.error("Failed to fetch analytics: " + response.data.message);
            }
        } catch (error) {
            // ... (error handling remains the same)
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            toast.error("Authentication token required for analytics access.");
            return;
        }
        fetchAnalytics();
    }, [token]);

    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">Loading Analytics...</div>;
    }
    
    if (!analyticsData) {
        return <div className="p-4 text-center text-red-500">No analytics data available or failed to load.</div>;
    }

    // Destructure the new metric: totalUnitsSold
    const { totalRevenue, totalOrders, currentMonthRevenue, totalCustomers, newCustomersThisMonth, topProducts, dailyRevenueTrend, totalUnitsSold } = analyticsData;

    // --- CHART DATA PREPARATION ---
    const topProductsChartData = (topProducts || []).slice(0, 5).map(p => ({
        name: p.productName || "Unknown",
        Revenue: p.revenue,
    }));
    
    const existingCustomers = totalCustomers - newCustomersThisMonth;
    const customerData = [
        { name: 'Existing Customers', value: existingCustomers > 0 ? existingCustomers : 0 },
        { name: 'New Customers This Month', value: newCustomersThisMonth },
    ];
    const PIE_COLORS = ['#8884d8', '#82ca9d']; 

    // --- RENDER COMPONENT ---
    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
            
            {/* KPI Cards (5 columns for all metrics) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                
                {/* 1. Total Revenue Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
                    <p className="text-sm text-gray-500 uppercase font-semibold">Total Revenue</p>
                    <p className="text-3xl font-extrabold mt-1 text-indigo-700">{formatCurrency(totalRevenue)}</p>
                </div>

                {/* 2. Monthly Revenue Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                    <p className="text-sm text-gray-500 uppercase font-semibold">Revenue This Month</p>
                    <p className="text-3xl font-extrabold mt-1 text-green-700">{formatCurrency(currentMonthRevenue)}</p>
                </div>

                {/* 3. Total Orders Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
                    <p className="text-sm text-gray-500 uppercase font-semibold">Total Orders</p>
                    <p className="text-3xl font-extrabold mt-1 text-yellow-700">{totalOrders.toLocaleString()}</p>
                </div>
                
                {/* 4. NEW: Total Units Sold Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-cyan-500 hover:shadow-xl transition-shadow">
                    <p className="text-sm text-gray-500 uppercase font-semibold">Total Units Sold</p>
                    <p className="text-3xl font-extrabold mt-1 text-cyan-700">{totalUnitsSold.toLocaleString()}</p>
                </div>

                {/* 5. Total Customers Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-pink-500 hover:shadow-xl transition-shadow">
                    <p className="text-sm text-gray-500 uppercase font-semibold">Total Customers</p>
                    <p className="text-3xl font-extrabold mt-1 text-pink-700">{totalCustomers.toLocaleString()}</p>
                </div>
            </div>

            {/* --- CHARTS SECTION (2x2 Grid) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* ROW 1, COL 1: Top 5 Product Performance Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">Top 5 Product Revenue</h2>
                    {topProductsChartData.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={topProductsChartData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#555"
                                        angle={-15} 
                                        textAnchor="end"
                                        height={50} 
                                    />
                                    <YAxis 
                                        tickFormatter={(value) => formatCurrency(value)} 
                                        stroke="#555"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="Revenue" fill="#4f46e5" name="Product Revenue" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-gray-500 h-full flex items-center justify-center">No product sales recorded yet.</p>
                    )}
                </div>

                {/* ROW 1, COL 2: Revenue Trend Area Chart (The "Statistic Wave") */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">Monthly Revenue Trend (Wave)</h2>
                    {dailyRevenueTrend && dailyRevenueTrend.length > 0 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={dailyRevenueTrend} 
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorRevenueTrend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="date" stroke="#555" />
                                    <YAxis 
                                        tickFormatter={(value) => formatCurrency(value)} 
                                        stroke="#555"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="Revenue" 
                                        stroke="#2563eb" 
                                        fillOpacity={1} 
                                        fill="url(#colorRevenueTrend)" 
                                        name="Daily Revenue"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-gray-500 h-full flex items-center justify-center">No time-series revenue data available to show the trend.</p>
                    )}
                </div>
                
                {/* ROW 2, SPAN 2: Customer Insights Doughnut Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">Customer Acquisition Breakdown</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        
                        {/* Data Summary */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 border rounded-lg bg-purple-50">
                                <span className="text-gray-600 font-medium">Total Registered Customers</span>
                                <span className="text-2xl font-bold text-purple-700">{totalCustomers.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded-lg bg-green-50">
                                <span className="text-gray-600 font-medium">New Customers (This Month)</span>
                                <span className="text-2xl font-bold text-green-700">{newCustomersThisMonth.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Doughnut Chart */}
                        <div className="md:col-span-2" style={{ height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={customerData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70} 
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        isAnimationActive={false} 
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {customerData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={PIE_COLORS[index % PIE_COLORS.length]} 
                                                stroke={PIE_COLORS[index % PIE_COLORS.length]}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;