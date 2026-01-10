import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
    useGetPurchaseOrdersQuery,
    useUpdatePOStatusMutation,
    useReceivePOItemsMutation,
    purchaseOrderApi
} from '../services/purchaseOrderApi';
import { FiPlus, FiSearch, FiTruck, FiPackage, FiCheckCircle, FiClock, FiFileText } from 'react-icons/fi';
import { usePermissions } from '../hooks/usePermissions';
import { useSocket } from '../context/SocketContext';
import { POStatus } from '../types';
import POForm from '../components/PurchaseOrders/POForm';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import ReceiptModal from '../components/PurchaseOrders/ReceiptModal';
import Pagination from '../components/Common/Pagination';

const PurchaseOrders = () => {
    const dispatch = useDispatch();
    const { socket } = useSocket();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [status, setStatus] = useState<string>('');
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [statusConfirm, setStatusConfirm] = useState<{ id: string, status: POStatus, po?: any } | null>(null);
    const [receivePO, setReceivePO] = useState<any | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            dispatch(purchaseOrderApi.util.invalidateTags(['PurchaseOrder']));
        };

        socket.on('po_created', handleUpdate);
        socket.on('po_updated', handleUpdate);

        return () => {
            socket.off('po_created', handleUpdate);
            socket.off('po_updated', handleUpdate);
        };
    }, [socket, dispatch]);

    const { data: response, isLoading } = useGetPurchaseOrdersQuery({ page, search: debouncedSearch, status });
    const [updateStatus] = useUpdatePOStatusMutation();
    const [receiveItems] = useReceivePOItemsMutation();

    const purchaseOrders = response?.data || [];
    const totalItems = response?.pagination?.total || 0;
    const limit = response?.pagination?.limit || 20;
    const totalPages = Math.ceil(totalItems / limit);
    const { canManage } = usePermissions();

    const handleStatusClick = (id: string, newStatus: POStatus) => {
        setStatusConfirm({ id, status: newStatus });
    };

    const handleConfirmStatusUpdate = async () => {
        if (!statusConfirm) return;
        try {
            await updateStatus({ id: statusConfirm.id, status: statusConfirm.status }).unwrap();
            toast.success(`Status updated to ${statusConfirm.status}`);
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setStatusConfirm(null);
        }
    };

    const handleReceiveClick = (po: any) => {
        setReceivePO(po);
    };

    const handleConfirmReceive = async (items: any[]) => {
        if (!receivePO) return;

        try {
            await receiveItems({ id: receivePO._id, items }).unwrap();
            toast.success('Items received and stock updated!');
            setReceivePO(null);
        } catch (err) {
            toast.error('Failed to receive items: ' + ((err as any).data?.message || 'Unknown error'));
        }
    };

    // Helper to safely get supplier ID string
    const getSupplierIdString = (supplierId: any): string => {
        if (!supplierId) return '';
        if (typeof supplierId === 'string') return supplierId;
        if (typeof supplierId === 'object' && supplierId._id) return supplierId._id;
        return String(supplierId);
    };

    return (
        <div className="space-y-6 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Purchase Orders</h1>
                    <p className="text-gray-400 font-medium">Replenish stock and track supplier deliveries</p>
                </div>
                {canManage && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 font-bold text-sm active:scale-95"
                    >
                        <FiPlus size={20} />
                        <span>New Purchase Order</span>
                    </button>
                )}
            </div>

            <div className="bg-dark-card rounded-2xl shadow-sm border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700 bg-gray-800/50 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by PO # or supplier..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 bg-gray-800 text-white outline-none transition-all placeholder:text-gray-500 font-primary text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 bg-gray-800 text-white cursor-pointer text-sm font-medium outline-none"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value={POStatus.DRAFT}>Draft</option>
                        <option value={POStatus.SENT}>Sent</option>
                        <option value={POStatus.CONFIRMED}>Confirmed</option>
                        <option value={POStatus.RECEIVED}>Received</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-700">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">PO #</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
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
                            ) : purchaseOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3 opacity-50">
                                            <FiFileText size={48} className="text-gray-600" />
                                            <p className="text-sm font-bold">No purchase orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                purchaseOrders.map((po) => {
                                    const supplierIdStr = getSupplierIdString(po.supplierId);

                                    return (
                                        <tr key={po._id} className="hover:bg-gray-800/50 transition-colors group">
                                            <td className="px-6 py-5 font-black text-blue-400 text-sm">
                                                #{po.poNumber}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white tracking-tight">
                                                        {typeof po.supplierId === 'object' && po.supplierId !== null && 'name' in po.supplierId
                                                            ? (po.supplierId as any).name
                                                            : po.supplierName || 'Unknown Supplier'}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-gray-500 mt-0.5">
                                                        Supplier ID: {supplierIdStr.length > 6 ? supplierIdStr.slice(-6) : supplierIdStr}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-0.5">
                                                    {po.items.slice(0, 2).map((item: any, idx: number) => (
                                                        <span key={idx} className="text-xs text-gray-300">
                                                            {typeof item.productId === 'object' && item.productId !== null && 'name' in item.productId
                                                                ? `${(item.productId as any).name} (${item.variantSku})`
                                                                : item.variantSku}
                                                        </span>
                                                    ))}
                                                    {po.items.length > 2 && (
                                                        <span className="text-[10px] font-bold text-gray-500">
                                                            +{po.items.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-black text-white">
                                                ${po.totalAmount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-5">
                                                <POStatusBadge status={po.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {canManage && po.status === POStatus.DRAFT && (
                                                        <button
                                                            onClick={() => handleStatusClick(po._id, POStatus.SENT)}
                                                            className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-xl transition-all border border-transparent hover:border-blue-500/20 shadow-sm active:scale-95"
                                                            title="Send to Supplier"
                                                        >
                                                            <FiTruck size={18} />
                                                        </button>
                                                    )}
                                                    {canManage && po.status === POStatus.SENT && (
                                                        <button
                                                            onClick={() => handleStatusClick(po._id, POStatus.CONFIRMED)}
                                                            className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-xl transition-all border border-transparent hover:border-amber-500/20 shadow-sm active:scale-95"
                                                            title="Confirm PO"
                                                        >
                                                            <FiCheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    {canManage && po.status === POStatus.CONFIRMED && (
                                                        <button
                                                            onClick={() => handleReceiveClick(po)}
                                                            className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-xl transition-all border border-transparent hover:border-emerald-500/20 shadow-sm active:scale-95"
                                                            title="Receive Items"
                                                        >
                                                            <FiPackage size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={totalItems}
                    limit={limit}
                />
            </div>

            {isFormOpen && (
                <POForm
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            <ReceiptModal
                isOpen={!!receivePO}
                onClose={() => setReceivePO(null)}
                onConfirm={handleConfirmReceive}
                po={receivePO}
            />

            <ConfirmationModal
                isOpen={!!statusConfirm}
                onClose={() => setStatusConfirm(null)}
                onConfirm={handleConfirmStatusUpdate}
                title={
                    statusConfirm?.status === POStatus.SENT ? 'Send to Supplier' :
                        statusConfirm?.status === POStatus.CONFIRMED ? 'Confirm Purchase Order' :
                            'Update Status'
                }
                message={
                    statusConfirm?.status === POStatus.SENT ? 'Are you sure you want to send this purchase order to the supplier?' :
                        statusConfirm?.status === POStatus.CONFIRMED ? 'Has the supplier confirmed this order?' :
                            'Are you sure you want to update the status?'
                }
                confirmText={
                    statusConfirm?.status === POStatus.SENT ? 'Send PO' :
                        statusConfirm?.status === POStatus.CONFIRMED ? 'Confirm' :
                            'Update'
                }
                isDangerous={false}
            />
        </div>
    );
};

const POStatusBadge = ({ status }: { status: POStatus }) => {
    const configs = {
        [POStatus.DRAFT]: { icon: <FiFileText size={12} />, bg: 'bg-gray-700/50', text: 'text-gray-300', border: 'border-gray-600', label: 'Draft' },
        [POStatus.SENT]: { icon: <FiTruck size={12} />, bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Sent' },
        [POStatus.CONFIRMED]: { icon: <FiClock size={12} />, bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Confirmed' },
        [POStatus.RECEIVED]: { icon: <FiCheckCircle size={12} />, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Received' },
    };

    const config = configs[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
            {config.icon}
            {config.label}
        </span>
    );
};

export default PurchaseOrders;
