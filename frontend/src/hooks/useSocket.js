import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

const useSocket = () => {
  const ctx = useContext(SocketContext);
  return ctx || { socket: null, connected: false };
};

export default useSocket;