import type { FC } from 'react';
import type { Tile } from '../types/domino';
import { DominoTile } from './DominoTile';
import { canPlayTile } from '../utils/dominoLogic';
import { SkipForward, Sparkles } from 'lucide-react';

interface PlayerHandProps {
  tiles: Tile[];
  leftEnd: number | null;
  rightEnd: number | null;
  isMyTurn: boolean;
  selectedTile: Tile | null;
  onSelectTile: (tile: Tile) => void;
  onPassTurn: () => void;
  playerName: string;
  score: number;
}

export const PlayerHand: FC<PlayerHandProps> = ({
  tiles,
  leftEnd,
  rightEnd,
  isMyTurn,
  selectedTile,
  onSelectTile,
  onPassTurn,
  playerName,
  score,
}) => {
  // Verifica quais pedras da mão podem ser jogadas
  const playableTilesInfo = tiles.map((tile) => ({
    tile,
    ...canPlayTile(tile, leftEnd, rightEnd),
  }));

  const hasAnyPlayable = playableTilesInfo.some((info) => info.canPlay);
  const isSelected = (tile: Tile) =>
    selectedTile && selectedTile[0] === tile[0] && selectedTile[1] === tile[1];

  return (
    <div
      className={`w-full max-w-4xl mx-auto p-2.5 sm:p-3 rounded-2xl transition-all duration-300 ${
        isMyTurn
          ? 'bg-neutral-900/90 border-2 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
          : 'bg-neutral-900/70 border border-neutral-800'
      }`}
    >
      {/* Barra superior da mão do jogador */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-neutral-950 font-black flex items-center justify-center text-sm shadow-md">
            S
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-neutral-100">{playerName} (Você)</span>
              {isMyTurn ? (
                <span className="flex items-center space-x-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40 font-semibold animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span>Sua Vez!</span>
                </span>
              ) : (
                <span className="text-xs text-neutral-400">Aguardando jogada...</span>
              )}
            </div>
            <span className="text-xs text-neutral-400">
              {score} pts • {tiles.length} {tiles.length === 1 ? 'pedra restante' : 'pedras restantes'}
            </span>
          </div>
        </div>

        {/* Ação de Passar a Vez */}
        {isMyTurn && (
          <div>
            {!hasAnyPlayable ? (
              <button
                onClick={onPassTurn}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-red-400 transition-transform active:scale-95 cursor-pointer animate-bounce"
              >
                <SkipForward className="w-4 h-4" />
                <span>Sem jogada: Passar a Vez</span>
              </button>
            ) : (
              <span className="text-xs text-neutral-400 italic hidden sm:inline">
                {selectedTile ? 'Escolha uma ponta na mesa para jogar' : 'Clique em uma pedra iluminada'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Exibição das pedras na mão */}
      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 py-2">
        {tiles.map((tile, idx) => {
          const playable = isMyTurn && canPlayTile(tile, leftEnd, rightEnd).canPlay;
          const selected = isSelected(tile);

          return (
            <div key={idx} className="relative group">
              <DominoTile
                tile={tile}
                isPlayable={playable}
                isSelected={!!selected}
                onClick={() => playable && onSelectTile(tile)}
                size="md"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
