import type { FC } from 'react';
import type { Player } from '../types/domino';
import { Trophy, RotateCcw, AlertTriangle } from 'lucide-react';

interface ScoreModalProps {
  winner: number | null;
  winReason: 'domino' | 'blocked' | null | undefined;
  players: (Player | null)[];
  onRestart: () => void;
  mySeat: number | null;
  roundNumber: number;
}

export const ScoreModal: FC<ScoreModalProps> = ({
  winner,
  winReason,
  players,
  onRestart,
  mySeat,
  roundNumber,
}) => {
  const isWinnerMe = winner !== null && winner === mySeat;
  const winnerPlayer = winner !== null && winner >= 0 ? players[winner] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border-2 border-emerald-500/50 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shadow-inner">
          {winner !== null && winner >= 0 ? (
            <Trophy className="w-8 h-8" />
          ) : (
            <AlertTriangle className="w-8 h-8" />
          )}
        </div>

        <h2 className="text-2xl font-black text-neutral-100 mb-1">
          {winner !== null && winner >= 0
            ? isWinnerMe
              ? '🎉 Você Venceu a Rodada!'
              : `🏆 ${winnerPlayer?.name} Venceu!`
            : '🔒 Jogo Trancado em Empate!'}
        </h2>

        <p className="text-sm text-neutral-400 mb-6">
          {winReason === 'domino'
            ? 'Bateu o jogo esvaziando todas as pedras da mão!'
            : winReason === 'blocked'
            ? 'O jogo trancou e venceu quem tinha a menor soma de pontos nas pedras!'
            : 'Fim da rodada.'}
        </p>

        {/* Placar Geral */}
        <div className="bg-neutral-950/70 rounded-2xl border border-neutral-800 p-4 mb-6 text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Placar Geral (Rodada {roundNumber})
          </div>
          <div className="space-y-2">
            {players.map((p, idx) => {
              if (!p) return null;
              const isMe = idx === mySeat;
              const isThisWinner = idx === winner;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl text-sm ${
                    isThisWinner
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold'
                      : isMe
                      ? 'bg-neutral-800/80 text-neutral-200 font-semibold'
                      : 'text-neutral-400'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="truncate">
                      {p.name} {isMe && '(Você)'}
                    </span>
                  </div>
                  <span className="font-mono text-base font-bold">{p.score} pts</span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl transition-all cursor-pointer hover:scale-[1.02]"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Iniciar Próxima Rodada</span>
        </button>
      </div>
    </div>
  );
};
