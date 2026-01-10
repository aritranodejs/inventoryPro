import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (items: Array<{ productId: string; variantSku: string; quantity: number, price?: number }>) => void;
    po: any;
}

const ReceiptModal = ({ isOpen, onClose, onConfirm, po }: ReceiptModalProps) => {
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && po) {
            setItems(po.items.map((item: any) => ({
                productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
                variantSku: item.variantSku,
                productName: item.productId?.name || item.variantSku,
                orderedQuantity: item.orderedQuantity,
                receivedQuantity: item.receivedQuantity || 0,
                currentReceipt: item.orderedQuantity - (item.receivedQuantity || 0),
                price: item.price || 0
            })));
        }
    }, [isOpen, po]);

    if (!isOpen || !po) return null;

    const handleQuantityChange = (sku: string, val: string | number) => {
        const valStr = val.toString();
        const parsedVal = parseInt(valStr);
        setItems((prev: any[]) => prev.map((item: any) => {
            if (item.variantSku === sku) {
                const max = item.orderedQuantity - item.receivedQuantity;
                if (valStr === '') return { ...item, currentReceipt: '' };
                const finalVal = isNaN(parsedVal) ? 0 : Math.max(0, Math.min(max, parsedVal));
                return { ...item, currentReceipt: finalVal };
            }
            return item;
        }));
    };

    const handlePriceChange = (sku: string, val: string | number) => {
        const valStr = val.toString();
        setItems((prev: any[]) => prev.map((item: any) => {
            if (item.variantSku === sku) {
                if (valStr === '') return { ...item, price: '' };
                const parsedVal = parseFloat(valStr);
                return { ...item, price: isNaN(parsedVal) ? 0 : parsedVal };
            }
            return item;
        }));
    };

    const handleConfirm = () => {
        const payload = items
            .filter((item: any) => item.currentReceipt > 0)
            .map((item: any) => ({
                productId: item.productId,
                variantSku: item.variantSku,
                quantity: item.currentReceipt,
                price: item.price
            }));

        if (payload.length === 0) {
            alert('Please specify quantity for at least one item');
            return;
        }
        onConfirm(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-dark-card w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden scale-100 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div>
                        <h3 className="text-xl font-bold text-white">Receive Items</h3>
                        <p className="text-xs text-gray-400 mt-1">PO #{po.poNumber} • Adjust quantities and prices as received</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {items.map((item: any) => {
                        const remaining = item.orderedQuantity - item.receivedQuantity;
                        if (remaining <= 0) return null;

                        return (
                            <div key={item.variantSku} className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white">{item.productName}</p>
                                    <p className="text-[10px] uppercase font-black text-gray-500 tracking-wider">SKU: {item.variantSku}</p>
                                    <p className="text-xs text-blue-400 font-bold">{remaining} remaining of {item.orderedQuantity} ordered</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-black text-gray-500">Qty to Receive</label>
                                        <input
                                            type="number"
                                            value={item.currentReceipt}
                                            onChange={(e) => handleQuantityChange(item.variantSku, e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-black text-gray-500">Actual Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.price}
                                            onChange={(e) => handlePriceChange(item.variantSku, e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
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
                        Confirm Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
