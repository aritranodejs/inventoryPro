import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { UserRole } from '../../types';
import {
    FiBox,
    FiGrid,
    FiShoppingCart,
    FiTruck,
    FiFileText,
    FiActivity,
    FiPackage,
    FiX
} from 'react-icons/fi';

interface SidebarProps {
    isMobileOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isMobileOpen, onClose }: SidebarProps) => {
    const { user } = useAppSelector((state) => state.auth);

    if (!user) return null;

    const links = [
        { name: 'Dashboard', path: '/', icon: FiGrid, roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF] },
        { name: 'Products', path: '/products', icon: FiPackage, roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF] },
        { name: 'Orders', path: '/orders', icon: FiShoppingCart, roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.STAFF] },
        { name: 'Suppliers', path: '/suppliers', icon: FiTruck, roles: [UserRole.OWNER, UserRole.MANAGER] },
        { name: 'Purchase Orders', path: '/purchase-orders', icon: FiFileText, roles: [UserRole.OWNER, UserRole.MANAGER] },
        { name: 'Stock Movements', path: '/stock-movements', icon: FiActivity, roles: [UserRole.OWNER, UserRole.MANAGER] },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 bg-[#1a1f2e] border-r border-gray-700/50
                transform transition-transform duration-300 ease-in-out
                lg:transform-none
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                flex flex-col h-screen
            `}>
                {/* Logo */}
                <div className="h-16 bg-[#1a1f2e] border-b border-gray-700/50 flex items-center px-6">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                                <FiBox color="#ffffff" size={20} />
                            </div>
                            <span className="text-xl font-bold text-white">
                                Inventory<span className="text-blue-500">Pro</span>
                            </span>
                        </div>
                        {/* Close button for mobile */}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 overflow-y-auto">
                    <div className="flex flex-col gap-2">
                        {links.map((link) => {
                            return (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    end={link.path === '/'}
                                    onClick={() => onClose()}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                                        ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                        }`
                                    }
                                >
                                    <link.icon size={20} />
                                    <span>{link.name}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>

                {/* Status Footer */}
                <div className="p-4 border-t border-gray-700/50">
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            System Status
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm text-gray-200">Online</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
