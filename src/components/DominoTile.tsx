import type { FC } from 'react';
import type { Tile } from '../types/domino';

interface DominoTileProps {
  tile: Tile;
  orientation?: 'vertical' | 'horizontal';
  isPlayable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  hidden?: boolean; // When showing back of opponent tiles
}

// Renderiza a metade com os pontos (pips) de 0 a 6
const PipHalf: FC<{ value: number; size: 'sm' | 'md' | 'lg' }> = ({ value, size }) => {
  const pipSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const containerSizes = {
    sm: 'w-8 h-8 p-1',
    md: 'w-11 h-11 p-1.5',
    lg: 'w-14 h-14 p-2',
  };

  const pipClass = `${pipSizes[size]} bg-neutral-900 rounded-full shadow-inner`;

  // Layout 3x3 grid para posicionar os pontos
  const renderPips = () => {
    switch (value) {
      case 0:
        return null;
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className={pipClass} />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-start"><span className={pipClass} /></div>
            <div className="flex justify-end"><span className={pipClass} /></div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-start"><span className={pipClass} /></div>
            <div className="flex justify-center"><span className={pipClass} /></div>
            <div className="flex justify-end"><span className={pipClass} /></div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-between"><span className={pipClass} /><span className={pipClass} /></div>
            <div className="flex justify-between"><span className={pipClass} /><span className={pipClass} /></div>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-between"><span className={pipClass} /><span className={pipClass} /></div>
            <div className="flex justify-center"><span className={pipClass} /></div>
            <div className="flex justify-between"><span className={pipClass} /><span className={pipClass} /></div>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full flex flex-col justify-between p-0.5">
            <div className="flex justify-between"><span className={pipClass} /><span className={pipClass} /></div>
            <div className="flex justify-between"><span className={pipClass} /><span className={pipClass} /></div>
            <div className="flex justify-between"><span className={pipClass} /><span className={pipClass} /></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${containerSizes[size]} flex items-center justify-center relative`}>
      {renderPips()}
    </div>
  );
};

export const DominoTile: FC<DominoTileProps> = ({
  tile,
  orientation = 'vertical',
  isPlayable = false,
  isSelected = false,
  onClick,
  size = 'md',
  hidden = false,
}) => {
  const [val1, val2] = tile;

  if (hidden) {
    // Verso da pedra de dominó (madeira nobre ou resina azul marinho)
    const hiddenSizes = {
      sm: orientation === 'vertical' ? 'w-8 h-16' : 'w-16 h-8',
      md: orientation === 'vertical' ? 'w-11 h-22' : 'w-22 h-11',
      lg: orientation === 'vertical' ? 'w-14 h-28' : 'w-28 h-14',
    };

    return (
      <div
        className={`${hiddenSizes[size]} rounded-lg bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 border-2 border-amber-700/60 shadow-lg flex items-center justify-center select-none`}
      >
        <div className="w-3/4 h-3/4 border border-amber-600/30 rounded-md flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-amber-500/40" />
        </div>
      </div>
    );
  }

  const borderClass = isSelected
    ? 'ring-4 ring-emerald-400 scale-105 shadow-xl -translate-y-2'
    : isPlayable
    ? 'ring-2 ring-amber-400 hover:ring-amber-300 hover:scale-105 hover:-translate-y-1 shadow-md cursor-pointer'
    : 'border border-amber-200/80 shadow-sm opacity-90';

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`relative inline-flex ${
        orientation === 'vertical' ? 'flex-col' : 'flex-row'
      } bg-stone-50 rounded-lg p-0.5 transition-all duration-200 select-none ${borderClass}`}
      style={{
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.25), 0 2px 4px -2px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.8)',
      }}
    >
      <PipHalf value={val1} size={size} />

      {/* Divisor central com o pino de metal clássico */}
      <div
        className={`${
          orientation === 'vertical' ? 'w-full h-0.5 my-0.5' : 'h-full w-0.5 mx-0.5'
        } bg-stone-300 relative flex items-center justify-center`}
      >
        <span className="absolute w-1.5 h-1.5 rounded-full bg-amber-600/70 shadow-inner" />
      </div>

      <PipHalf value={val2} size={size} />
    </div>
  );
};
