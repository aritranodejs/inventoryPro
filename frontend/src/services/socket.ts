import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket: Socket = io(URL, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
});

export const connectSocket = (token: string) => {
    socket.auth = { token };
    socket.connect();
};

export const disconnectSocket = () => {
    socket.disconnect();
};
