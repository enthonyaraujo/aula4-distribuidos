import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { GameRoom } from './gameRoom.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos gerados pela build do Vite em dist/
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Mapa de salas ativas em memória
const rooms = new Map();

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new GameRoom(roomId, io));
  }
  return rooms.get(roomId);
}

// Handlers do Socket.io
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentSeat = null;

  socket.on('join-room', ({ roomId, playerName }, callback) => {
    currentRoomId = roomId || 'mesa-principal';
    const room = getOrCreateRoom(currentRoomId);
    
    socket.join(currentRoomId);
    const result = room.addPlayer(socket.id, playerName);

    if (result.success) {
      currentSeat = result.seat;
      if (callback) callback({ success: true, seat: currentSeat, roomId: currentRoomId });
    } else {
      if (callback) callback({ success: false, message: result.message });
    }
  });

  socket.on('fill-bots', ({ roomId }) => {
    const room = rooms.get(roomId || currentRoomId);
    if (room) {
      room.fillWithBots();
    }
  });

  socket.on('play-tile', ({ roomId, tile, side }, callback) => {
    const room = rooms.get(roomId || currentRoomId);
    if (!room) return;

    if (currentSeat === null) {
      currentSeat = room.players.findIndex((p) => p && p.id === socket.id);
    }

    const res = room.playTile(currentSeat, tile, side);
    if (callback) callback(res);
  });

  socket.on('pass-turn', ({ roomId }, callback) => {
    const room = rooms.get(roomId || currentRoomId);
    if (!room) return;

    if (currentSeat === null) {
      currentSeat = room.players.findIndex((p) => p && p.id === socket.id);
    }

    const res = room.passTurn(currentSeat);
    if (callback) callback(res);
  });

  socket.on('restart-round', ({ roomId }) => {
    const room = rooms.get(roomId || currentRoomId);
    if (room) {
      room.roundNumber++;
      room.startRound();
    }
  });

  socket.on('disconnect', () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      const room = rooms.get(currentRoomId);
      room.removePlayer(socket.id);
      // Se não sobrar nenhum jogador humano na sala, podemos limpar após algum tempo
      const hasHuman = room.players.some((p) => p && !p.isBot);
      if (!hasHuman && currentRoomId !== 'mesa-principal') {
        rooms.delete(currentRoomId);
      }
    }
  });
});

// Fallback SPA para o React (compatível com Express 5)
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🎲 Dominó Online iniciado com sucesso!`);
  console.log(`🌐 Servidor rodando em: http://0.0.0.0:${PORT}`);
  console.log(`=========================================`);
});
