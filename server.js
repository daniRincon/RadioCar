const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos desde la carpeta build de React
app.use(express.static(path.join(__dirname, 'client/build')));

// Configuración del puerto serial
const port = new SerialPort({ 
  path: 'COM6', 
  baudRate: 9600 
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }
  console.log('Puerto serial abierto');
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');
});

parser.on('data', (data) => {
  console.log('Dato recibido:', data);
  io.emit('ecg_data', data);
});

// Manejar cualquier solicitud que no coincida con las rutas anteriores
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Manejo de errores para el puerto serial
port.on('error', function(err) {
  console.log('Error en el puerto serial: ', err.message);
});