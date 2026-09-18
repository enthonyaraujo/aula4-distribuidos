import { useRef, useEffect, useState, type FC, type MouseEvent } from 'react';
import type { PlacedTile, MoveSide } from '../types/domino';
import { DominoTile } from './DominoTile';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronsLeft,
  ChevronsRight,
  MoveHorizontal,
} from 'lucide-react';

interface DominoBoardProps {
  board: PlacedTile[];
  leftEnd: number | null;
  rightEnd: number | null;
  canPlayOnLeft: boolean;
  canPlayOnRight: boolean;
  canPlayAny?: boolean;
  isMyTurn: boolean;
  selectedTile: [number, number] | null;
  onPlay: (side: MoveSide) => void;
}

export const DominoBoard: FC<DominoBoardProps> = ({
  board,
  leftEnd,
  rightEnd,
  canPlayOnLeft,
  canPlayOnRight,
  isMyTurn,
  selectedTile,
  onPlay,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [autoFit, setAutoFit] = useState<boolean>(true);

  // Estados para arrastar a mesa com o mouse (Drag to Pan)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Calcula escala automática com base na quantidade de pedras
  useEffect(() => {
    if (autoFit) {
      if (board.length <= 8) {
        setZoom(1);
      } else if (board.length <= 13) {
        setZoom(0.85);
      } else if (board.length <= 18) {
        setZoom(0.72);
      } else {
        setZoom(0.6);
      }
    }
  }, [board.length, autoFit]);

  // Centraliza a visão quando novas pedras entram
  useEffect(() => {
    if (scrollContainerRef.current && !isDragging) {
      const container = scrollContainerRef.current;
      // Scroll suave para o centro
      container.scrollTo({
        left: (container.scrollWidth - container.clientWidth) / 2,
        behavior: 'smooth',
      });
    }
  }, [board.length, zoom]);

  // Handlers para arrastar com o mouse
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiplicador de sensibilidade
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // Atalhos para navegar até as pontas
  const scrollToLeftEnd = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const scrollToRightEnd = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[220px] bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-2xl border-4 border-emerald-950 shadow-2xl flex flex-col justify-between overflow-hidden select-none">
      {/* Textura sutil de feltro */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* BARRA SUPERIOR DA MESA: PONTAS E BOTÕES DE AÇÃO DIRETOS */}
      <div className="relative z-20 flex items-center justify-between gap-2 p-2 sm:px-4 sm:py-2 bg-emerald-950/80 backdrop-blur-md border-b border-emerald-800/40 text-xs font-semibold">
        {/* PONTA ESQUERDA (Atalho de clique direto se jogável) */}
        {board.length > 0 && (
          <div>
            {isMyTurn && selectedTile && canPlayOnLeft ? (
              <button
                onClick={() => onPlay('left')}
                className="animate-pulse flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black px-3 py-1.5 rounded-full shadow-lg border border-amber-300 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>JOGAR NA ESQUERDA ({leftEnd})</span>
              </button>
            ) : (
              <span className="flex items-center space-x-1 bg-emerald-900/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700/60">
                <span className="text-neutral-400">Ponta Esquerda:</span>
                <strong className="text-amber-300 font-bold text-sm">{leftEnd}</strong>
              </span>
            )}
          </div>
        )}

        {/* CONTROLES CENTRAIS: ZOOM E AUTO-AJUSTE */}
        <div className="flex items-center space-x-1 bg-emerald-950/90 p-1 rounded-xl border border-emerald-800/60 text-emerald-300">
          <button
            onClick={() => {
              setAutoFit(false);
              setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))));
            }}
            title="Reduzir zoom"
            className="p-1 hover:bg-emerald-800/60 rounded-lg cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono px-1">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => {
              setAutoFit(false);
              setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))));
            }}
            title="Aumentar zoom"
            className="p-1 hover:bg-emerald-800/60 rounded-lg cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-emerald-800 mx-0.5" />
          <button
            onClick={() => setAutoFit(!autoFit)}
            title={autoFit ? 'Desativar auto-ajuste' : 'Ajustar peças automaticamente à tela'}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition ${
              autoFit
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-emerald-800/60 text-emerald-300'
            }`}
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Ajustar</span>
          </button>
        </div>

        {/* PONTA DIREITA (Atalho de clique direto se jogável) */}
        {board.length > 0 && (
          <div>
            {isMyTurn && selectedTile && canPlayOnRight ? (
              <button
                onClick={() => onPlay('right')}
                className="animate-pulse flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black px-3 py-1.5 rounded-full shadow-lg border border-amber-300 transition cursor-pointer"
              >
                <span>JOGAR NA DIREITA ({rightEnd})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="flex items-center space-x-1 bg-emerald-900/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700/60">
                <span className="text-neutral-400">Ponta Direita:</span>
                <strong className="text-amber-300 font-bold text-sm">{rightEnd}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ÁREA DE SCROLL / DRAG DAS PEDRAS NO TABULEIRO */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`relative flex-1 w-full flex items-center overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-emerald-700/60 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* MESA VAZIA */}
        {board.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center p-6 text-emerald-200/70">
            {isMyTurn && selectedTile ? (
              <button
                onClick={() => onPlay('left')}
                className="animate-bounce flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-neutral-950 font-black px-6 py-3.5 rounded-2xl shadow-2xl transition cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Colocar pedra inicial na mesa</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-800/40 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Aguardando a primeira jogada da rodada...</span>
              </div>
            )}
          </div>
        ) : (
          /* CONTAINER CENTRALIZADO COM ESCALA E ESPAÇAMENTO GENEROSO (SEM CORTES) */
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
            className="min-w-full w-max flex items-center justify-center px-20 py-8 space-x-2 flex-nowrap"
          >
            {/* Botão contextual na ponta esquerda da fila */}
            {isMyTurn && selectedTile && canPlayOnLeft && (
              <button
                onClick={() => onPlay('left')}
                className="flex-shrink-0 animate-bounce flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3.5 py-2 rounded-xl shadow-xl border border-amber-300 transition cursor-pointer mr-3 z-10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs font-black">Encaixar ({leftEnd})</span>
              </button>
            )}

            {/* Pedras colocadas no tabuleiro */}
            {board.map((placed) => (
              <div key={placed.id} className="flex-shrink-0 transition-transform">
                <DominoTile
                  tile={placed.tile}
                  orientation={placed.isDouble ? 'vertical' : 'horizontal'}
                  size="sm"
                />
              </div>
            ))}

            {/* Botão contextual na ponta direita da fila */}
            {isMyTurn && selectedTile && canPlayOnRight && (
              <button
                onClick={() => onPlay('right')}
                className="flex-shrink-0 animate-bounce flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3.5 py-2 rounded-xl shadow-xl border border-amber-300 transition cursor-pointer ml-3 z-10"
              >
                <span className="text-xs font-black">Encaixar ({rightEnd})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* SETAS DE NAVEGAÇÃO RÁPIDA FLUTUANTES NAS BORDAS */}
        {board.length > 5 && (
          <>
            <button
              onClick={scrollToLeftEnd}
              title="Ir para a ponta esquerda"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-emerald-950/90 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/80 flex items-center justify-center shadow-lg cursor-pointer transition hover:scale-110"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollToRightEnd}
              title="Ir para a ponta direita"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-emerald-950/90 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/80 flex items-center justify-center shadow-lg cursor-pointer transition hover:scale-110"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* DICA DE NAVEGAÇÃO NO RODAPÉ DA MESA */}
      <div className="relative z-10 px-4 py-1 bg-emerald-950/90 border-t border-emerald-800/40 flex items-center justify-between text-[10px] text-emerald-300/70">
        <span className="flex items-center space-x-1">
          <MoveHorizontal className="w-3 h-3" />
          <span>Arraste com o mouse para rolar a mesa</span>
        </span>
        <span>{board.length} pedras na mesa</span>
      </div>
    </div>
  );
};
