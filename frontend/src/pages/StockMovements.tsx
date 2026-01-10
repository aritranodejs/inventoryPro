import { useState } from 'react';
import { useGetStockMovementsQuery, MovementType } from '../services/stockMovementApi';
import { FiArrowUp, FiArrowDown, FiRefreshCw, FiGrid, FiList, FiClock, FiActivity } from 'react-icons/fi';
import { format } from 'date-fns';

const StockMovements = () => {
    const [type, setType] = useState<string>('');
    const [page] = useState(1);

    const { data: response, isLoading } = useGetStockMovementsQuery({ type, page });
    const movements = response?.data || [];

    return (
        <div className="space-y-6 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Stock Movements</h1>
                    <p className="text-gray-400 font-medium">Audit trail of all inventory changes across all products</p>
                </div>
                <div className="flex items-center gap-4 bg-gray-800 p-1 rounded-xl border border-gray-700 shadow-sm">
                    <button
                        className={`p-2 rounded-lg transition-all ${type === '' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                        onClick={() => setType('')}
                    >
                        <FiGrid size={18} />
                    </button>
                    <button
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${type === MovementType.PURCHASE ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                        onClick={() => setType(MovementType.PURCHASE)}
                    >
                        Purchases
                    </button>
                    <button
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${type === MovementType.SALE ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                        onClick={() => setType(MovementType.SALE)}
                    >
                        Sales
                    </button>
                    <button
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${type === MovementType.ADJUSTMENT ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                        onClick={() => setType(MovementType.ADJUSTMENT)}
                    >
                        Adjustments
                    </button>
                </div>
            </div>

            <div className="bg-dark-card rounded-2xl shadow-sm border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-700">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product / SKU</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason / Ref</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">User</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse bg-gray-800/20">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-4 bg-gray-700 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : movements.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                            <FiActivity size={64} className="text-gray-600" />
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-widest">Audit log empty</p>
                                                <p className="text-xs font-medium">No stock movements found for the selected filters</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                movements.map((m) => (
                                    <tr key={m._id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <TypeBadge type={m.type} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white tracking-tight">{m.productName || 'Unknown Product'}</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{m.variantSku}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-black ${m.quantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {m.quantity > 0 ? '+' : ''}{m.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-300">{m.reason || 'Auto-generated'}</span>
                                                {m.referenceId && (
                                                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tight">Ref: #{m.referenceId.slice(-8)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                <FiClock size={12} />
                                                {m.createdAt ? (() => {
                                                    try {
                                                        return format(new Date(m.createdAt), 'MMM d, HH:mm');
                                                    } catch (e) {
                                                        return 'Just now';
                                                    }
                                                })() : 'Just now'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-black text-gray-400">{m.userName || 'System'}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const TypeBadge = ({ type }: { type: MovementType }) => {
    const configs = {
        [MovementType.PURCHASE]: { icon: <FiArrowDown size={10} />, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Purchase' },
        [MovementType.SALE]: { icon: <FiArrowUp size={10} />, bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Sale' },
        [MovementType.RETURN]: { icon: <FiRefreshCw size={10} />, bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Return' },
        [MovementType.ADJUSTMENT]: { icon: <FiList size={10} />, bg: 'bg-gray-700/50', text: 'text-gray-300', border: 'border-gray-600', label: 'Adjustment' },
    };

    const config = configs[type];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.text} ${config.border}`}>
            {config.icon}
            {config.label}
        </span>
    );
};

export default StockMovements;
