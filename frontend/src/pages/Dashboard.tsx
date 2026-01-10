import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useGetDashboardStatsQuery,
    useGetTopSellersQuery,
    useGetStockMovementStatsQuery
} from '../services/dashboardApi';
import {
    FiPackage,
    FiTrendingUp,
    FiAlertTriangle,
    FiShoppingBag,
    FiArrowRight,
    FiActivity
} from 'react-icons/fi';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface StatCardProps {
    title: string;
    value: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'amber' | 'red';
    loading?: boolean;
    trend?: { value: string; positive: boolean };
    onClick?: () => void;
}

const StatCard = ({ title, value, description, icon: Icon, color, loading, trend, onClick }: StatCardProps) => {
    const colorStyles = {
        blue: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            text: 'text-blue-400',
            glow: 'shadow-glow-blue',
            icon: 'bg-blue-500/20 text-blue-400'
        },
        green: {
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            text: 'text-green-400',
            glow: 'shadow-glow-green',
            icon: 'bg-green-500/20 text-green-400'
        },
        amber: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            text: 'text-amber-400',
            glow: 'shadow-lg',
            icon: 'bg-amber-500/20 text-amber-400'
        },
        red: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            text: 'text-red-400',
            glow: 'shadow-glow-red',
            icon: 'bg-red-500/20 text-red-400'
        }
    };

    const styles = colorStyles[color];

    return (
        <div
            className={`relative overflow-hidden rounded-xl border ${styles.bg} ${styles.border} p-6 transition-all duration-300 hover:-translate-y-1 ${styles.glow} hover:border-opacity-40 group ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${styles.icon}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${trend.positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {trend.positive ? '↑' : '↓'} {trend.value}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
                {loading ? (
                    <div className="h-10 w-32 bg-gray-700 animate-pulse rounded-lg" />
                ) : (
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${styles.text} tracking-tight`}>{value}</span>
                    </div>
                )}
                <p className="text-xs text-gray-500 mt-2">{description || 'Last 30 days'}</p>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
    const { data: topSellers, isLoading: topSellersLoading } = useGetTopSellersQuery();
    const { data: movementData, isLoading: movementLoading } = useGetStockMovementStatsQuery();

    const lineChartData = useMemo(() => ({
        labels: movementData?.data?.map(d => d.date) || [],
        datasets: [
            {
                label: 'Stock In',
                data: movementData?.data?.map(d => d.in) || [],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                borderWidth: 2,
            },
            {
                label: 'Stock Out',
                data: movementData?.data?.map(d => d.out) || [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                borderWidth: 2,
            },
        ],
    }), [movementData]);

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#f9fafb',
                bodyColor: '#d1d5db',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
            }
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#6b7280',
                    font: { size: 11 }
                }
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#6b7280',
                    font: { size: 11 }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    return (
        <div className="space-y-8 p-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-400 text-sm">Monitor your inventory performance and analytics</p>
                </div>
                <div className="flex items-center gap-3 bg-dark-card border border-gray-700 rounded-lg px-4 py-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm text-gray-300 font-medium">Live Data</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Inventory Value"
                    value={`$${stats?.data?.inventoryValue?.toLocaleString() || '0'}`}
                    icon={FiTrendingUp}
                    color="blue"
                    trend={{ value: '12.5%', positive: true }}
                    loading={statsLoading}
                    onClick={() => navigate('/products')}
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={stats?.data?.lowStockCount?.toString() || '0'}
                    description="Items below threshold"
                    icon={FiAlertTriangle}
                    color="amber"
                    loading={statsLoading}
                    onClick={() => navigate('/products')}
                />
                <StatCard
                    title="Total Products"
                    value={stats?.data?.totalProducts?.toString() || '0'}
                    icon={FiPackage}
                    color="green"
                    trend={{ value: '8.2%', positive: true }}
                    loading={statsLoading}
                    onClick={() => navigate('/products')}
                />
                <StatCard
                    title="Pending Orders"
                    value={stats?.data?.pendingPOCount?.toString() || '0'}
                    icon={FiShoppingBag}
                    color="red"
                    loading={statsLoading}
                    onClick={() => navigate('/purchase-orders')}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stock Movement Chart */}
                <div className="lg:col-span-2 bg-dark-card border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <FiActivity className="text-blue-400" />
                                Stock Movement
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">Last 7 days performance</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-400 font-medium">Stock In</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-xs text-gray-400 font-medium">Stock Out</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        {movementLoading ? (
                            <div className="w-full h-full bg-gray-800 animate-pulse rounded-lg"></div>
                        ) : (
                            <Line data={lineChartData} options={lineChartOptions} />
                        )}
                    </div>
                </div>

                {/* Top Sellers */}
                <div className="bg-dark-card border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
                    <h3 className="text-xl font-bold text-white mb-2">Top Performers</h3>
                    <p className="text-sm text-gray-400 mb-6">Best selling products</p>

                    <div className="space-y-4">
                        {topSellersLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-16 bg-gray-800 animate-pulse rounded-lg"></div>
                            ))
                        ) : topSellers?.data && topSellers.data.length > 0 ? (
                            topSellers.data.slice(0, 5).map((seller, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all group cursor-pointer"
                                    onClick={() => navigate('/orders')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                {seller.name}
                                            </p>
                                            <p className="text-xs text-gray-400">{seller.totalQuantity} units sold</p>
                                        </div>
                                    </div>
                                    <span className="text-green-400 font-semibold text-sm">
                                        ${seller.totalRevenue?.toLocaleString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <p>No sales data available</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/orders')}
                        className="mt-6 w-full py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        View Full Report
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-2">Need to Restock?</h3>
                        <p className="text-blue-100 max-w-md">
                            {stats?.data?.lowStockCount && stats.data.lowStockCount > 0
                                ? `${stats.data.lowStockCount} product${stats.data.lowStockCount > 1 ? 's' : ''} running low on stock. Review and create purchase orders now.`
                                : 'All products are well stocked. Keep monitoring for optimal inventory levels.'
                            }
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/purchase-orders')}
                        className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:shadow-2xl hover:scale-105 transition-all"
                    >
                        {stats?.data?.lowStockCount && stats.data.lowStockCount > 0 ? 'Create Purchase Order' : 'View Purchase Orders'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
