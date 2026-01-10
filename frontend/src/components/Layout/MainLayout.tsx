import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAppSelector } from '../../app/hooks';

const MainLayout = () => {
    const { token } = useAppSelector((state) => state.auth);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen bg-dark-primary overflow-hidden">
            <Sidebar
                isMobileOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto bg-dark-primary">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
