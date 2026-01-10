import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    limit: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    limit
}) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-800/30 border-t border-gray-700 gap-4">
            <div className="text-sm text-gray-400">
                Showing <span className="font-bold text-white">{startItem}</span> to{' '}
                <span className="font-bold text-white">{endItem}</span> of{' '}
                <span className="font-bold text-white">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <FiChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first, last, and pages around current
                        if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === page
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'text-gray-400 hover:bg-gray-700 hover:text-white border border-transparent hover:border-gray-600'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                        ) {
                            return (
                                <span key={page} className="px-1 text-gray-500">
                                    ...
                                </span>
                            );
                        }
                        return null;
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <FiChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
