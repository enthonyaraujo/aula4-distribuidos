import type { FC } from 'react';
import type { Player, SeatPosition } from '../types/domino';
import { DominoTile } from './DominoTile';
import { Bot, User } from 'lucide-react';

interface OpponentHandProps {
  player: Player | null;
  seatPosition: SeatPosition;
  isTurn: boolean;
  seatNumber: number;
}

export const OpponentHand: FC<OpponentHandProps> = ({
  player,
  seatPosition,
  isTurn,
  seatNumber,
}) => {
  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-900/40 border border-neutral-800 text-neutral-500 text-[10px]">
        <span className="w-6 h-6 rounded-full border border-dashed border-neutral-700 flex items-center justify-center mb-0.5 font-bold">
          {seatNumber + 1}
        </span>
        <span>Aguardando</span>
      </div>
    );
  }

  const isVertical = seatPosition === 'west' || seatPosition === 'east';
  const tileOrientation = isVertical ? 'horizontal' : 'vertical';

  return (
    <div
      className={`flex ${
        isVertical ? 'flex-col items-center w-20 sm:w-24' : 'flex-row items-center gap-3'
      } p-2 rounded-xl transition-all duration-300 ${
        isTurn
          ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-102'
          : 'bg-neutral-900/70 border border-neutral-800'
      }`}
    >
      {/* Informações do Jogador */}
      <div className={`flex items-center space-x-1.5 ${isVertical ? 'mb-1.5' : ''}`}>
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            player.isBot ? 'bg-indigo-900 text-indigo-300' : 'bg-emerald-900 text-emerald-300'
          }`}
        >
          {player.isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
        </div>
        <div className="text-left overflow-hidden">
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-bold text-neutral-200 truncate max-w-[70px] sm:max-w-[85px]">
              {player.name}
            </span>
            {isTurn && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
            )}
          </div>
          <div className="text-[9px] text-neutral-400 leading-none">
            {player.score} pts • {player.tilesCount} {player.tilesCount === 1 ? 'pedra' : 'pedras'}
          </div>
        </div>
      </div>

      {/* Exibição das pedras (viradas de costas ou reveladas no fim) */}
      <div
        className={`flex ${
          isVertical ? 'flex-col -space-y-4' : 'flex-row -space-x-4'
        } justify-center items-center`}
      >
        {player.tiles ? (
          // Fim de jogo: revelação das peças
          player.tiles.map((tile, idx) => (
            <div key={idx} className="transition-transform hover:scale-110">
              <DominoTile tile={tile} size="sm" orientation={tileOrientation} />
            </div>
          ))
        ) : (
          // Durante o jogo: apenas o verso das peças
          Array.from({ length: player.tilesCount }).map((_, idx) => (
            <div key={idx} className="transition-transform hover:-translate-y-1">
              <DominoTile
                tile={[0, 0]}
                hidden={true}
                size="sm"
                orientation={tileOrientation}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
