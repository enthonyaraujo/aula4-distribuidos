import { useState, type FC, type FormEvent } from 'react';
import { Users, Play } from 'lucide-react';

interface LobbyModalProps {
  onJoin: (name: string, room: string) => void;
  isConnected: boolean;
}

export const LobbyModal: FC<LobbyModalProps> = ({ onJoin, isConnected }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('mesa-1');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onJoin(name.trim(), room.trim() || 'mesa-1');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-emerald-500/40 rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shadow-inner">
          <Users className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-black text-neutral-100 tracking-tight mb-2">
          Dominó Online
        </h1>
        <p className="text-sm text-neutral-400 mb-6">
          Multiplayer para 4 pessoas em tempo real com WebSockets.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Seu Nome ou Apelido
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Enthony"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-neutral-100 placeholder-neutral-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Código da Sala
            </label>
            <input
              type="text"
              placeholder="Ex: mesa-1"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-neutral-100 placeholder-neutral-500 outline-none transition font-mono"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Jogadores com o mesmo código de sala entram na mesma mesa.
            </span>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !isConnected}
            className="w-full mt-6 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl transition cursor-pointer hover:scale-[1.01]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Entrar na Partida</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-center space-x-2 text-xs text-neutral-400">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span>
            {isConnected ? 'Servidor de jogo conectado' : 'Conectando ao servidor...'}
          </span>
        </div>
      </div>
    </div>
  );
};
