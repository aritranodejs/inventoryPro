import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../services/authApi';
import { FiLogOut, FiUser, FiBell, FiSettings, FiChevronDown, FiMenu } from 'react-icons/fi';

interface NavbarProps {
    onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [logoutApi] = useLogoutMutation();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-16 bg-dark-secondary border-b border-gray-700 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-4">
                {/* Hamburger Menu (Mobile Only) */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                    <FiMenu size={24} />
                </button>

                <span className="text-white font-semibold text-base md:text-lg hidden sm:block">{user?.companyName}</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-md">
                    {user?.role}
                </span>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                    <FiBell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-700"></div>

                {/* User Menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-all"
                    >
                        <div className="text-right">
                            <p className="text-sm font-semibold text-white">{user?.name}</p>
                            <p className="text-xs text-gray-400">View profile</p>
                        </div>

                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                            <FiUser size={20} />
                        </div>

                        <FiChevronDown className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-dark-card border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                            <div className="p-4 border-b border-gray-700">
                                <p className="text-sm font-semibold text-white">{user?.name}</p>
                                <p className="text-xs text-gray-400">{user?.email}</p>
                            </div>

                            <div className="py-2">
                                <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 transition-all flex items-center gap-3">
                                    <FiUser size={16} />
                                    View Profile
                                </button>
                                <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 transition-all flex items-center gap-3">
                                    <FiSettings size={16} />
                                    Settings
                                </button>
                            </div>

                            <div className="border-t border-gray-700 py-2">
                                <button
                                    onClick={async () => {
                                        setShowUserMenu(false);
                                        try {
                                            await logoutApi().unwrap();
                                        } catch (error) {
                                            console.error('Logout failed:', error);
                                        } finally {
                                            dispatch(logout());
                                        }
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-3"
                                >
                                    <FiLogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
