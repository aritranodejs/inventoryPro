import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    useGetSuppliersQuery,
    useDeleteSupplierMutation
} from '../services/supplierApi';
import { usePermissions } from '../hooks/usePermissions';
import { FiPlus, FiSearch, FiTruck, FiEdit2, FiTrash2, FiMail, FiPhone } from 'react-icons/fi';
import { format } from 'date-fns';
import SupplierForm from '../components/Suppliers/SupplierForm';
import type { Supplier } from '../services/supplierApi';
import ConfirmationModal from '../components/Common/ConfirmationModal';
import Pagination from '../components/Common/Pagination';

const Suppliers = () => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>(undefined);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const { data: response, isLoading } = useGetSuppliersQuery({ page, search: debouncedSearch });
    const [deleteSupplier] = useDeleteSupplierMutation();
    const { canDelete, canCreateEdit } = usePermissions();

    const suppliers = response?.data || [];
    const totalItems = response?.pagination?.total || 0;
    const limit = response?.pagination?.limit || 10;
    const totalPages = Math.ceil(totalItems / limit);

    const handleAdd = () => {
        setSelectedSupplier(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteSupplier(deleteId).unwrap();
            toast.success('Supplier deleted successfully');
        } catch (err) {
            toast.error('Failed to delete supplier');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Suppliers</h1>
                    <p className="text-xs md:text-sm text-gray-400 font-medium">Manage your supply chain and pricing history</p>
                </div>
                {canCreateEdit && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 font-bold text-sm md:text-base w-full md:w-auto active:scale-95"
                    >
                        <FiPlus size={20} />
                        <span>New Supplier</span>
                    </button>
                )}
            </div>

            <div className="bg-dark-card rounded-2xl shadow-sm border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700 bg-gray-800/50">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 bg-gray-800 text-white outline-none transition-all placeholder:text-gray-500 font-primary"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 border-b border-gray-700">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Established</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse bg-gray-800/20">
                                        <td colSpan={4} className="px-6 py-8">
                                            <div className="h-4 bg-gray-700 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center text-gray-600">
                                        <div className="flex flex-col items-center gap-3 opacity-60">
                                            <FiTruck size={48} className="text-gray-700" />
                                            <p className="text-sm font-bold">No suppliers registered</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier) => (
                                    <tr key={supplier._id} className="hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white tracking-tight">{supplier.name}</span>
                                                <span className="text-xs text-gray-500 mt-0.5">{supplier.contactPerson}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                    <FiMail size={12} className="text-gray-600" />
                                                    {supplier.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                                    <FiPhone size={12} className="text-gray-600" />
                                                    {supplier.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {format(new Date(supplier.createdAt), 'MMM yyyy')}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {canCreateEdit && (
                                                    <button
                                                        onClick={() => handleEdit(supplier)}
                                                        className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-xl transition-all border border-transparent hover:border-blue-500/20"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDeleteClick(supplier._id)}
                                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
                <SupplierForm
                    supplier={selectedSupplier}
                    onClose={() => setIsFormOpen(false)}
                />
            )}

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Supplier"
                message="Are you sure you want to delete this supplier? This action cannot be undone."
                confirmText="Delete Supplier"
                isDangerous={true}
            />
        </div>
    );
};

export default Suppliers;
