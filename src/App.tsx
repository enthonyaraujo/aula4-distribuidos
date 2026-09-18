import { useState, useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { GameState, Tile, MoveSide } from './types/domino';
import { canPlayTile } from './utils/dominoLogic';
import { DominoBoard } from './components/DominoBoard';
import { PlayerHand } from './components/PlayerHand';
import { OpponentHand } from './components/OpponentHand';
import { LobbyModal } from './components/LobbyModal';
import { ScoreModal } from './components/ScoreModal';
import { Bot, Copy, Check, Sparkles } from 'lucide-react';

let socket: Socket | null = null;

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [inLobby, setInLobby] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('mesa-1');
  const [mySeat, setMySeat] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Inicialização do Socket.io
  useEffect(() => {
    // Conecta no mesmo host ou porta configurada
    socket = io();

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('game-state', (state: GameState) => {
      setGameState(state);
      // Se houver nova ação, exibe aviso temporário
      if (state.lastAction) {
        setStatusNotice(state.lastAction);
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // Entrar em uma sala
  const handleJoinRoom = (name: string, room: string) => {
    if (!socket) return;
    setPlayerName(name);
    setRoomId(room);

    socket.emit('join-room', { roomId: room, playerName: name }, (res: any) => {
      if (res.success) {
        setMySeat(res.seat);
        setInLobby(false);
      } else {
        alert(res.message || 'Erro ao entrar na sala.');
      }
    });
  };

  // Preencher assentos vazios com Bots
  const handleFillBots = () => {
    if (!socket) return;
    socket.emit('fill-bots', { roomId });
  };

  // Selecionar pedra na mão
  const handleSelectTile = (tile: Tile) => {
    if (selectedTile && selectedTile[0] === tile[0] && selectedTile[1] === tile[1]) {
      setSelectedTile(null); // Desmarcar
    } else {
      setSelectedTile(tile);

      // Se a mesa estiver vazia, pode jogar direto na esquerda
      if (gameState?.board.length === 0) {
        handlePlayTile('left', tile);
      }
    }
  };

  // Efetuar jogada
  const handlePlayTile = (side: MoveSide, overrideTile?: Tile) => {
    const tileToPlay = overrideTile || selectedTile;
    if (!socket || !tileToPlay) return;

    socket.emit('play-tile', { roomId, tile: tileToPlay, side }, (res: any) => {
      if (res.success) {
        setSelectedTile(null);
      } else {
        alert(res.message || 'Jogada inválida!');
      }
    });
  };

  // Passar a vez
  const handlePassTurn = () => {
    if (!socket) return;
    socket.emit('pass-turn', { roomId }, (res: any) => {
      if (!res.success) {
        alert(res.message || 'Não é possível passar a vez!');
      }
    });
  };

  // Reiniciar rodada
  const handleRestartRound = () => {
    if (!socket) return;
    socket.emit('restart-round', { roomId });
  };

  // Copiar link de convite
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Se estiver no lobby, renderiza modal inicial
  if (inLobby) {
    return <LobbyModal onJoin={handleJoinRoom} isConnected={isConnected} />;
  }

  const players = gameState?.players || [null, null, null, null];
  const myPlayer = mySeat !== null ? players[mySeat] : null;
  const isMyTurn = gameState?.currentTurn === mySeat && gameState?.status === 'playing';

  // Assentos relativos para visualização em 1ª pessoa
  const westSeat = mySeat !== null ? (mySeat + 1) % 4 : 1;
  const northSeat = mySeat !== null ? (mySeat + 2) % 4 : 2;
  const eastSeat = mySeat !== null ? (mySeat + 3) % 4 : 3;

  const westPlayer = players[westSeat];
  const northPlayer = players[northSeat];
  const eastPlayer = players[eastSeat];

  // Checagem de jogada para a pedra atualmente selecionada
  const tileCheck = selectedTile
    ? canPlayTile(selectedTile, gameState?.leftEnd ?? null, gameState?.rightEnd ?? null)
    : { canPlayLeft: false, canPlayRight: false, canPlay: false };

  const activePlayersCount = players.filter((p) => p !== null).length;

  return (
    <div className="h-screen max-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-2 sm:p-3 select-none relative overflow-hidden">
      {/* HEADER SUPERIOR */}
      <header className="flex flex-wrap items-center justify-between gap-2 bg-neutral-900/80 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-neutral-800 shadow-lg">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-white text-base shadow-md">
            🎲
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-neutral-100 leading-none">
              Dominó Online
            </h1>
            <span className="text-[10px] text-emerald-400/80 font-medium">
              Sistemas Distribuídos • 4 Jogadores
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Badge da Sala */}
          <div className="flex items-center space-x-1.5 bg-neutral-800/80 px-2.5 py-1 rounded-xl border border-neutral-700 text-xs">
            <span className="text-neutral-400">Sala:</span>
            <span className="font-mono font-bold text-amber-300">{roomId}</span>
            <button
              onClick={handleCopyLink}
              title="Copiar link da sala"
              className="ml-1 text-neutral-400 hover:text-neutral-200 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Botão para preencher assentos vazios com Bots */}
          {gameState?.status === 'waiting' && activePlayersCount < 4 && (
            <button
              onClick={handleFillBots}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-xl shadow transition cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Bots ({4 - activePlayersCount})</span>
            </button>
          )}

          {/* Status da Conexão */}
          <div className="flex items-center space-x-1 text-xs text-neutral-400 bg-neutral-950/60 px-2 py-1 rounded-xl border border-neutral-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400' : 'bg-red-500'
              }`}
            />
            <span className="hidden sm:inline">
              {isConnected ? 'Online' : 'Desconectado'}
            </span>
          </div>
        </div>
      </header>

      {/* BANNER DE STATUS / TURNO */}
      <div className="my-1 text-center">
        <div className="inline-flex items-center space-x-2 bg-neutral-900/90 border border-neutral-800 px-3 py-1 rounded-full text-xs text-neutral-300 shadow-md">
          {isMyTurn ? (
            <span className="text-emerald-400 font-bold animate-pulse flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>É A SUA VEZ DE JOGAR!</span>
            </span>
          ) : (
            <span>{statusNotice || 'Aguardando ação da mesa...'}</span>
          )}
        </div>
      </div>

      {/* MESA DO JOGO COM OS 4 JOGADORES */}
      <main className="flex-1 min-h-0 flex flex-col justify-between max-w-7xl w-full mx-auto gap-2">
        {/* OPONENTE NORTE (CIMA) */}
        <div className="flex justify-center flex-shrink-0">
          <OpponentHand
            player={northPlayer}
            seatPosition="north"
            isTurn={gameState?.currentTurn === northSeat}
            seatNumber={northSeat}
          />
        </div>

        {/* ÁREA CENTRAL: OESTE + TABULEIRO + LESTE */}
        <div className="flex-1 min-h-[200px] flex items-center justify-between gap-2 w-full">
          {/* OPONENTE OESTE (ESQUERDA) */}
          <div className="flex-shrink-0">
            <OpponentHand
              player={westPlayer}
              seatPosition="west"
              isTurn={gameState?.currentTurn === westSeat}
              seatNumber={westSeat}
            />
          </div>

          {/* TABULEIRO CENTRAL */}
          <div className="flex-1 min-w-0 h-full flex flex-col justify-center">
            <DominoBoard
              board={gameState?.board || []}
              leftEnd={gameState?.leftEnd ?? null}
              rightEnd={gameState?.rightEnd ?? null}
              canPlayOnLeft={tileCheck.canPlayLeft}
              canPlayOnRight={tileCheck.canPlayRight}
              canPlayAny={tileCheck.canPlay}
              isMyTurn={!!isMyTurn}
              selectedTile={selectedTile}
              onPlay={handlePlayTile}
            />
          </div>

          {/* OPONENTE LESTE (DIREITA) */}
          <div className="flex-shrink-0">
            <OpponentHand
              player={eastPlayer}
              seatPosition="east"
              isTurn={gameState?.currentTurn === eastSeat}
              seatNumber={eastSeat}
            />
          </div>
        </div>

        {/* JOGADOR LOCAL SUL (EMBAIXO) */}
        <div className="w-full">
          <PlayerHand
            tiles={myPlayer?.tiles || []}
            leftEnd={gameState?.leftEnd ?? null}
            rightEnd={gameState?.rightEnd ?? null}
            isMyTurn={!!isMyTurn}
            selectedTile={selectedTile}
            onSelectTile={handleSelectTile}
            onPassTurn={handlePassTurn}
            playerName={playerName}
            score={myPlayer?.score || 0}
          />
        </div>
      </main>

      {/* MODAL DE FIM DE RODADA */}
      {gameState?.status === 'round_ended' && (
        <ScoreModal
          winner={gameState.winner}
          winReason={gameState.winReason}
          players={gameState.players}
          onRestart={handleRestartRound}
          mySeat={mySeat}
          roundNumber={gameState.roundNumber}
        />
      )}
    </div>
  );
}
