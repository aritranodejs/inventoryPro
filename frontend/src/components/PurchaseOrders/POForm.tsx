import { useState } from 'react';
import { useGetSuppliersQuery } from '../../services/supplierApi';
import { useGetProductsQuery } from '../../services/productApi';
import { useCreatePurchaseOrderMutation } from '../../services/purchaseOrderApi';
import { FiX, FiSave, FiSearch, FiFileText, FiTrash2 } from 'react-icons/fi';
import type { Product, POItem } from '../../types';

interface POFormProps {
    onClose: () => void;
}

const POForm: React.FC<POFormProps> = ({ onClose }) => {
    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState<POItem[]>([]);
    const [search, setSearch] = useState('');

    const { data: suppliersRes } = useGetSuppliersQuery({});
    const { data: productsRes, isLoading: productsLoading } = useGetProductsQuery({ search });
    const [createPO, { isLoading: isCreating }] = useCreatePurchaseOrderMutation();

    const suppliers = suppliersRes?.data || [];
    const products = productsRes?.data || [];

    const addItem = (product: Product, variantIndex: number) => {
        const variant = product.variants[variantIndex];
        const existingItemIndex = items.findIndex(item => item.variantSku === variant.sku);

        if (existingItemIndex > -1) {
            const newItems = [...items];
            newItems[existingItemIndex].orderedQuantity += 1;
            setItems(newItems);
        } else {
            setItems([...items, {
                productId: product._id,
                variantSku: variant.sku,
                productName: `${product.name}${variant.size || variant.color ? ` (${[variant.size, variant.color].filter(Boolean).join(' ')})` : ''}`,
                orderedQuantity: 1,
                price: variant.price,
                receivedQuantity: 0
            }]);
        }
    };

    const removeItem = (sku: string) => {
        setItems(items.filter(item => item.variantSku !== sku));
    };

    const updateQuantity = (sku: string, qty: number) => {
        if (qty < 1) return;
        setItems(items.map(item => item.variantSku === sku ? { ...item, orderedQuantity: qty } : item));
    };

    const updateTotalAmount = items.reduce((acc, item) => acc + (item.price * item.orderedQuantity), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierId || items.length === 0) return;

        try {
            const formattedItems = items.map(({ productId, variantSku, orderedQuantity, receivedQuantity, price }) => ({
                productId,
                variantSku,
                orderedQuantity,
                receivedQuantity,
                price
            }));

            const safeTotalAmount = isNaN(updateTotalAmount) ? 0 : updateTotalAmount;

            await createPO({
                supplierId,
                items: formattedItems,
                totalAmount: safeTotalAmount
            }).unwrap();
            onClose();
        } catch (err) {
            alert('Failed to create purchase order');
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 h-full md:h-[95vh] w-full max-w-2xl md:rounded-3xl shadow-2xl shadow-blue-900/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-gray-800">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-500">
                            <FiFileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">New Purchase Order</h2>
                            <p className="text-sm text-gray-400 font-medium">Request stock from your supplier</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white group">
                        <FiX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-6 space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Select Supplier</label>
                            <div className="relative">
                                <select
                                    className="w-full px-5 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer font-medium"
                                    value={supplierId}
                                    onChange={(e) => setSupplierId(e.target.value)}
                                >
                                    <option value="">Choose a Supplier...</option>
                                    {suppliers.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.contactPerson})</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Search Products</label>
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-600 font-medium"
                                    placeholder="Find products to restock..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Product Results */}
                            <div className="mt-3 max-h-48 overflow-y-auto border border-gray-800 rounded-xl divide-y divide-gray-800 custom-scrollbar bg-gray-900/50">
                                {productsLoading ? (
                                    <div className="p-4 text-center text-gray-400 text-xs italic">Searching...</div>
                                ) : products.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-xs font-medium">No products found</div>
                                ) : (
                                    products.map(product => (
                                        <div key={product._id} className="p-3 hover:bg-gray-800/30 transition-colors">
                                            <div className="text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">{product.name}</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {product.variants.map((variant, vIdx) => (
                                                    <button
                                                        key={variant.sku}
                                                        onClick={() => addItem(product, vIdx)}
                                                        className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800 hover:bg-blue-600/10 hover:border-blue-500/30 border border-gray-700 transition-all text-left group"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-blue-400 uppercase tracking-wider">{variant.sku}</span>
                                                            <span className="text-xs font-medium text-gray-300 group-hover:text-blue-200">{variant.size} {variant.color}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs font-bold text-white group-hover:text-blue-300">${variant.price}</div>
                                                            <div className="text-[10px] font-bold text-emerald-500">In stock: {variant.stock}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-800/20 p-6 overflow-y-auto border-t border-gray-800 space-y-4 custom-scrollbar">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Order Items</h3>
                        {items.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-gray-600 gap-3 opacity-60">
                                <FiFileText size={48} />
                                <p className="text-xs font-bold uppercase tracking-widest">No items selected</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div key={item.variantSku} className="bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:border-gray-600 transition-colors">
                                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                                            <div className="text-sm font-bold text-white truncate pr-2">{item.productName}</div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-1 bg-gray-800/50 inline-block px-1.5 py-0.5 rounded border border-gray-800">{item.variantSku}</div>
                                        </div>
                                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                            <div className="text-right mr-2 min-w-[60px] hidden sm:block">
                                                <div className="text-xs font-bold text-white">${(item.price * item.orderedQuantity).toLocaleString()}</div>
                                                <div className="text-[10px] font-medium text-gray-400">${item.price} ea</div>
                                            </div>
                                            <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden bg-gray-800/50 shrink-0">
                                                <button
                                                    onClick={() => updateQuantity(item.variantSku, item.orderedQuantity - 1)}
                                                    className="px-3 py-1.5 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border-r border-gray-700"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    className="w-12 text-center text-xs font-bold text-white bg-transparent py-1.5 border-none outline-none focus:bg-gray-700 transition-colors appearance-none"
                                                    value={item.orderedQuantity}
                                                    onChange={(e) => updateQuantity(item.variantSku, parseInt(e.target.value) || 1)}
                                                />
                                                <button
                                                    onClick={() => updateQuantity(item.variantSku, item.orderedQuantity + 1)}
                                                    className="px-3 py-1.5 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border-l border-gray-700"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.variantSku)}
                                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900 space-y-4 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.3)] z-10">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium">Estimated Total</span>
                        <span className="text-3xl font-black text-white tracking-tight">${updateTotalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-800 hover:text-white transition-all border border-gray-700 hover:border-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isCreating || items.length === 0 || !supplierId}
                            className="flex-[2] py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <FiSave size={18} />
                            <span>{isCreating ? 'Creating PO...' : 'Create Purchase Order'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POForm;
