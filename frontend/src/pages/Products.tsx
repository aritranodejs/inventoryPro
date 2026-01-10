import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    useGetProductsQuery,
    useDeleteProductMutation
} from '../services/productApi';
import { usePermissions } from '../hooks/usePermissions';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiBox, FiFilter, FiMoreHorizontal } from 'react-icons/fi';
import { format } from 'date-fns';
import ProductForm from '../components/Products/ProductForm';
import type { Product } from '../types';
import ConfirmationModal from '../components/Common/ConfirmationModal';

const Products = () => {
    const [search, setSearch] = useState('');
    const [page] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data: response, isLoading } = useGetProductsQuery({ page, search });
    const [deleteProduct] = useDeleteProductMutation();
    const { canDelete, canCreateEdit } = usePermissions();

    const products = response?.data || [];

    const handleAdd = () => {
        setSelectedProduct(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteProduct(deleteId).unwrap();
            toast.success('Product deleted successfully');
        } catch (err) {
            toast.error('Failed to delete product');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in p-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Products</h1>
                    <p className="text-gray-400 font-medium mt-1">Manage your inventory and product variants with precision.</p>
                </div>
                {canCreateEdit && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 font-bold"
                    >
                        <FiPlus size={20} />
                        <span>New Product</span>
                    </button>
                )}
            </div>

            {/* Content Card */}
            <div className="bg-dark-card rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-800/30">
                    <div className="relative flex-1 max-w-md w-full">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Find a product..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 bg-gray-800 text-white font-medium placeholder:text-gray-500 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 transition-all font-semibold text-sm">
                            <FiFilter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-700">
                                <th className="px-6 py-4">Product Details</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Stock Inventory</th>
                                <th className="px-6 py-4">Date Added</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse bg-gray-800/20">
                                        <td colSpan={5} className="px-6 py-4">
                                            <div className="h-16 bg-gray-700 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                                                <FiBox size={40} className="text-gray-600" />
                                            </div>
                                            <div className="">
                                                <p className="text-lg font-bold text-white">No products yet</p>
                                                <p className="text-gray-500 text-sm font-medium">Add your first product to get started.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                                    const isLowStock = product.variants.some(v => v.stock <= product.lowStockThreshold);

                                    return (
                                        <tr key={product._id} className="group hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                                                        {product.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white group-hover:text-blue-400 transition-colors">{product.name}</span>
                                                        <span className="text-xs text-gray-500 font-bold">{product.variants.length} SKU Variants</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-bold uppercase tracking-wider">
                                                    {product.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-bold ${totalStock > 0 ? (isLowStock ? 'text-amber-500' : 'text-emerald-500') : 'text-red-500'
                                                            }`}>
                                                            {totalStock} Left
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-24 rounded-full bg-gray-700 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${totalStock > 0 ? (isLowStock ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${Math.min((totalStock / 100) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                                                {format(new Date(product.createdAt), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opactity-0 group-hover:opacity-100 transition-opacity">
                                                    {canCreateEdit && (
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="p-2 hover:bg-blue-500/10 hover:text-blue-400 rounded-lg transition-colors text-gray-500"
                                                        >
                                                            <FiEdit2 size={18} />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-gray-500"
                                                            onClick={() => handleDeleteClick(product._id)}
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    )}
                                                    <button className="p-2 hover:bg-gray-700 text-gray-500 rounded-lg transition-colors">
                                                        <FiMoreHorizontal size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {
                isFormOpen && (
                    <ProductForm
                        product={selectedProduct}
                        onClose={() => setIsFormOpen(false)}
                    />
                )
            }

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete Product"
                isDangerous={true}
            />
        </div>
    );
};

export default Products;
