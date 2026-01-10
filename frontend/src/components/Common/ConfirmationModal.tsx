import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDangerous = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-75">
            <div
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-75"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${isDangerous ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        <FiAlertTriangle size={24} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 hover:text-white transition-colors text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 text-sm ${isDangerous
                            ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-500/20'
                            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
