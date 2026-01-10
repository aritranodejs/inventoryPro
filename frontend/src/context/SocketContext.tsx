import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { socket as socketInstance, connectSocket, disconnectSocket } from '../services/socket';
import { Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { token } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (token) {
            console.log('Attempting to connect socket with token...');
            connectSocket(token);

            socketInstance.on('connect', () => {
                console.log('Socket connected successfully!');
                setIsConnected(true);
            });

            socketInstance.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            socketInstance.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setIsConnected(false);
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.off('connect');
                socketInstance.off('disconnect');
                disconnectSocket();
            };
        } else {
            setSocket(null);
            setIsConnected(false);
            disconnectSocket();
        }
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
