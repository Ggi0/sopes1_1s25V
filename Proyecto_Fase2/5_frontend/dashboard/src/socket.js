// socket.js
// Configuración centralizada del WebSocket para toda la aplicación
import { io } from 'socket.io-client';

// Crear una instancia única del socket conectando a tu API local
const socket = io('http://localhost:3001');

// Eventos de conexión para debugging
socket.on('connect', () => {
  console.log('WebSocket conectado correctamente');
});

socket.on('disconnect', () => {
  console.log('WebSocket desconectado');
});

socket.on('connect_error', (error) => {
  console.error('Error de conexión WebSocket:', error);
});

// Exportar la instancia para usar en otros componentes
export default socket;