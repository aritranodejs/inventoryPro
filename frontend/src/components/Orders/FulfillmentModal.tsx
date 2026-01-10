import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface FulfillmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (items: Array<{ variantSku: string; quantity: number }>) => void;
    items: any[];
    title: string;
}

const FulfillmentModal = ({ isOpen, onClose, onConfirm, items, title }: FulfillmentModalProps) => {
    const [quantities, setQuantities] = useState<{ [sku: string]: number }>({});

    useEffect(() => {
        if (isOpen && items) {
            const initial = items.reduce((acc, item) => ({
                ...acc,
                [item.variantSku]: (item.quantity - (item.fulfilledQuantity || 0))
            }), {});
            setQuantities(initial);
        }
    }, [isOpen, items]);

    if (!isOpen) return null;

    const handleQuantityChange = (sku: string, val: string | number, max: number) => {
        const valStr = val.toString();
        if (valStr === '') {
            setQuantities(prev => ({ ...prev, [sku]: '' as any }));
            return;
        }
        const parsedVal = parseInt(valStr);
        const value = isNaN(parsedVal) ? 0 : Math.max(0, Math.min(max, parsedVal));
        setQuantities(prev => ({ ...prev, [sku]: value }));
    };

    const handleConfirm = () => {
        const payload = Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([sku, qty]) => ({ variantSku: sku, quantity: qty }));

        if (payload.length === 0) {
            alert('Please specify quantity for at least one item');
            return;
        }
        onConfirm(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-dark-card w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {items.map((item) => {
                        const remaining = item.quantity - (item.fulfilledQuantity || 0);
                        return (
                            <div key={item.variantSku} className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold text-white mb-1">{item.productName || item.variantSku}</p>
                                        <p className="text-[10px] uppercase font-black text-gray-500 tracking-wider">SKU: {item.variantSku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-blue-400">{remaining} remaining</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        min="0"
                                        max={remaining}
                                        value={quantities[item.variantSku] === undefined ? remaining : quantities[item.variantSku]}
                                        onChange={(e) => handleQuantityChange(item.variantSku, e.target.value, remaining)}
                                        className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-medium"
                                    />
                                    <button
                                        onClick={() => handleQuantityChange(item.variantSku, remaining, remaining)}
                                        className="text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Max
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-6 bg-gray-800/30 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-bold text-gray-400 hover:bg-gray-800 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                        Confirm Fulfillment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FulfillmentModal;
