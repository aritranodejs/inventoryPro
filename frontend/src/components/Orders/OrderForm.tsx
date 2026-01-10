import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetProductsQuery } from '../../services/productApi';
import { useCreateOrderMutation } from '../../services/orderApi';
import { FiX, FiTrash2, FiSave, FiSearch, FiShoppingCart } from 'react-icons/fi';
import type { Product, OrderItem } from '../../types';

interface OrderFormProps {
    onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onClose }) => {
    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState<OrderItem[]>([]);
    const [search, setSearch] = useState('');

    const { data: productsRes, isLoading: productsLoading } = useGetProductsQuery({ search });
    const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

    const products = productsRes?.data || [];

    const addItem = (product: Product, variantIndex: number) => {
        const variant = product.variants[variantIndex];
        const existingItemIndex = items.findIndex(item => item.variantSku === variant.sku);

        if (existingItemIndex > -1) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += 1;
            setItems(newItems);
        } else {
            setItems([...items, {
                productId: product._id,
                variantSku: variant.sku,
                productName: `${product.name}${variant.size || variant.color ? ` (${[variant.size, variant.color].filter(Boolean).join(' ')})` : ''}`,
                quantity: 1,
                price: variant.price
            }]);
        }
    };

    const removeItem = (sku: string) => {
        setItems(items.filter(item => item.variantSku !== sku));
    };

    const updateQuantity = (sku: string, qty: number) => {
        if (qty < 1) return;
        setItems(items.map(item => item.variantSku === sku ? { ...item, quantity: qty } : item));
    };

    const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || items.length === 0) return;

        try {
            await createOrder({
                customerName,
                items,
                totalAmount
            }).unwrap();
            toast.success('Sales Order created successfully!');
            onClose();
        } catch (err: any) {
            const msg = err.data?.message || 'Failed to place order. Check stock availability.';
            toast.error(msg);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 h-full md:h-[95vh] w-full max-w-2xl md:rounded-3xl shadow-2xl shadow-blue-900/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-150 border-l border-gray-800">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-500">
                            <FiShoppingCart size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Create Sales Order</h2>
                            <p className="text-sm text-gray-400 font-medium">Draft a new order for your customer</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white group">
                        <FiX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-6 space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Customer Information</label>
                            <input
                                type="text"
                                className="w-full px-5 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-600 font-medium"
                                placeholder="Enter client or company name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">Add Products</label>
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-600 font-medium"
                                    placeholder="Search by name or category..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Product Search Results */}
                            <div className="mt-3 max-h-60 overflow-y-auto border border-gray-800 rounded-xl divide-y divide-gray-800 custom-scrollbar bg-gray-900/50">
                                {productsLoading ? (
                                    <div className="p-4 text-center text-gray-400 text-sm italic">Searching...</div>
                                ) : products.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-sm font-medium">No products matched your search</div>
                                ) : (
                                    products.map(product => (
                                        <div key={product._id} className="p-3 hover:bg-gray-800/30 transition-colors">
                                            <div className="text-sm font-bold text-gray-200 mb-2">{product.name}</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {product.variants.map((variant, vIdx) => (
                                                    <button
                                                        key={variant.sku}
                                                        onClick={() => addItem(product, vIdx)}
                                                        className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800 hover:bg-blue-600/10 hover:border-blue-500/30 border border-gray-700 transition-all text-left group"
                                                        disabled={variant.stock === 0}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-blue-400 uppercase tracking-wider">{variant.sku}</span>
                                                            <span className="text-xs text-gray-300 group-hover:text-blue-200">{variant.size} {variant.color}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs font-bold text-white group-hover:text-blue-300">${variant.price}</div>
                                                            <div className={`text-[10px] font-bold ${variant.stock < 5 ? 'text-amber-500' : 'text-gray-500'}`}>
                                                                {variant.stock} left
                                                            </div>
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

                    {/* Order Items List */}
                    <div className="flex-1 bg-gray-800/20 p-6 overflow-y-auto border-t border-gray-800 divide-y divide-gray-800 custom-scrollbar">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Items in Order</h3>
                        {items.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-gray-600 gap-3 opacity-60">
                                <FiShoppingCart size={48} />
                                <p className="text-sm text-center font-medium">Your order is empty.<br />Select products above.</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.variantSku} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-4">
                                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                                        <div className="text-sm font-bold text-white truncate pr-2">{item.productName}</div>
                                        <div className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-2">
                                            <span className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-gray-400 border border-gray-700">{item.variantSku}</span>
                                            <span className="text-gray-600">•</span>
                                            <span className="text-gray-300">${item.price} each</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 pl-0 sm:pl-4">
                                        <div className="flex items-center border border-gray-700 rounded-lg bg-gray-900 overflow-hidden shadow-sm shrink-0">
                                            <button
                                                onClick={() => updateQuantity(item.variantSku, item.quantity - 1)}
                                                className="px-3 py-1.5 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border-r border-gray-800"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                className="w-12 text-center text-sm font-bold text-white bg-transparent py-1.5 focus:outline-none appearance-none"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.variantSku, parseInt(e.target.value) || 1)}
                                            />
                                            <button
                                                onClick={() => updateQuantity(item.variantSku, item.quantity + 1)}
                                                className="px-3 py-1.5 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border-l border-gray-800"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="text-right min-w-[60px] hidden sm:block">
                                            <div className="text-sm font-bold text-white">${(item.price * item.quantity).toLocaleString()}</div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.variantSku)}
                                            className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900 space-y-4 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.3)] z-10">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium">Order Total</span>
                        <span className="text-3xl font-black text-white tracking-tight">${totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-800 hover:text-white transition-all border border-gray-700 hover:border-gray-600"
                        >
                            Discard Draft
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isCreating || items.length === 0 || !customerName}
                            className="flex-[2] py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                        >
                            <FiSave size={20} />
                            <span>{isCreating ? 'Processing...' : 'Place Order'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderForm;
