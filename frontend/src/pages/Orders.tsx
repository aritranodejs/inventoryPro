import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    useGetOrdersQuery,
    useFulfillOrderMutation,
    useCancelOrderMutation
} from '../services/orderApi';
import { usePermissions } from '../hooks/usePermissions';
import { FiPlus, FiSearch, FiShoppingBag, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { OrderStatus } from '../types';
import OrderForm from '../components/Orders/OrderForm';
import ConfirmationModal from '../components/Common/ConfirmationModal';

const Orders = () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('');
    const [page] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: response, isLoading } = useGetOrdersQuery({ page, search, status });
    const [fulfillOrder] = useFulfillOrderMutation();
    const [cancelOrder] = useCancelOrderMutation();
    const { canManage } = usePermissions();

    const orders = response?.data || [];

    const [confirmAction, setConfirmAction] = useState<{ type: 'fulfill' | 'cancel' | null, id: string | null }>({ type: null, id: null });

    const handleFulfillClick = (id: string) => {
        setConfirmAction({ type: 'fulfill', id });
    };

    const handleCancelClick = (id: string) => {
        setConfirmAction({ type: 'cancel', id });
    };

    const handleConfirmedAction = async () => {
        if (!confirmAction.id || !confirmAction.type) return;

        const id = confirmAction.id;

        try {
            if (confirmAction.type === 'fulfill') {
                await fulfillOrder(id).unwrap();
                toast.success('Order fulfilled successfully!');
            } else {
                await cancelOrder(id).unwrap();
                toast.success('Order cancelled successfully!');
            }
        } catch (err) {
            const action = confirmAction.type === 'fulfill' ? 'fulfill' : 'cancel';
            toast.error(`Failed to ${action} order: ` + ((err as any).data?.message || 'Unknown error'));
        } finally {
            setConfirmAction({ type: null, id: null });
        }
    };

    return (
        <div className="space-y-6 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Orders</h1>
                    <p className="text-gray-400">Manage customer orders and stock allocation</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg hover:shadow-blue-500/30"
                >
                    <FiPlus size={20} />
                    <span>New Order</span>
                </button>
            </div>

            <div className="bg-dark-card rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by order # or customer..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 bg-gray-800 text-white font-medium placeholder:text-gray-500 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 bg-gray-800 text-white cursor-pointer"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value={OrderStatus.PENDING}>Pending</option>
                        <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                        <option value={OrderStatus.FULFILLED}>Fulfilled</option>
                        <option value={OrderStatus.CANCELLED}>Cancelled</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-700">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order #</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse bg-gray-800/20">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-4 bg-gray-700 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <FiShoppingBag size={48} className="text-gray-600" />
                                            <p className="text-sm font-medium">No orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-blue-400 text-sm">
                                            #{order.orderNumber}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white tracking-tight">{order.customerName}</span>
                                                <span className="text-[10px] uppercase font-bold text-gray-500">{order.items.length} items</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-white">
                                            ${order.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-400">
                                            {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {canManage && (order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED) && (
                                                    <>
                                                        <button
                                                            onClick={() => handleFulfillClick(order._id)}
                                                            className="p-2 hover:bg-green-500/10 text-green-500 rounded-xl transition-all border border-transparent hover:border-green-500/20 shadow-sm active:scale-95"
                                                            title="Fulfill Order"
                                                        >
                                                            <FiCheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelClick(order._id)}
                                                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/20 shadow-sm active:scale-95"
                                                            title="Cancel Order"
                                                        >
                                                            <FiXCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isFormOpen && (
                <OrderForm
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            <ConfirmationModal
                isOpen={!!confirmAction.type}
                onClose={() => setConfirmAction({ type: null, id: null })}
                onConfirm={handleConfirmedAction}
                title={confirmAction.type === 'fulfill' ? 'Fulfill Order' : 'Cancel Order'}
                message={confirmAction.type === 'fulfill'
                    ? 'Are you sure you want to mark this order as fulfilled? This will deduct items from your inventory stock.'
                    : 'Are you sure you want to cancel this order? This action cannot be undone.'}
                confirmText={confirmAction.type === 'fulfill' ? 'Fulfill Order' : 'Cancel Order'}
                isDangerous={confirmAction.type === 'cancel'}
            />
        </div>
    );
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const configs = {
        [OrderStatus.PENDING]: { icon: <FiClock size={12} />, bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Pending' },
        [OrderStatus.CONFIRMED]: { icon: <FiClock size={12} />, bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Confirmed' },
        [OrderStatus.FULFILLED]: { icon: <FiCheckCircle size={12} />, bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', label: 'Fulfilled' },
        [OrderStatus.CANCELLED]: { icon: <FiXCircle size={12} />, bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Cancelled' },
    };

    const config = configs[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
            {config.icon}
            {config.label}
        </span>
    );
};

export default Orders;
