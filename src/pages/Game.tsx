import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { 
  Trophy, 
  RotateCcw, 
  History, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for combining Tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type GameStatus = 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'threefoldRepetition' | 'insufficientMaterial';

interface MoveHistory {
  san: string;
  from: string;
  to: string;
  color: string;
}

// --- Main App ---
export default function Game() {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Status computation
  const status = useMemo((): GameStatus => {
    if (game.isCheckmate()) return 'checkmate';
    if (game.isStalemate()) return 'stalemate';
    if (game.isDraw()) return 'draw';
    if (game.isThreefoldRepetition()) return 'threefoldRepetition';
    if (game.isInsufficientMaterial()) return 'insufficientMaterial';
    return 'playing';
  }, [game]);

  const isCheck = game.inCheck();
  const turn = game.turn() === 'w' ? 'White' : 'Black';

  // Handle Game Over
  useEffect(() => {
    if (status !== 'playing') {
      setShowModal(true);
    }
  }, [status]);

  // Scroll to bottom of move history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory]);

  // --- Move Logic ---
  const makeAMove = useCallback((move: string | { from: string; to: string; promotion?: string }) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        setMoveHistory((prev: MoveHistory[]) => [
          ...prev, 
          { san: result.san, from: result.from, to: result.to, color: result.color }
        ]);
        setMoveFrom(null);
        setOptionSquares({});
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game]);

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // default to queen for simplicity
    });
    return move;
  }

  // --- Click to Move & Highlighting ---
  function getMoveOptions(square: Square) {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: { [key: string]: object } = {};
    moves.map((move: Move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to as Square) && game.get(move.to as Square)?.color !== game.get(square)?.color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });

    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square: Square) {
    // 1. If we already selected a piece, try to move there
    if (moveFrom) {
      const move = makeAMove({
        from: moveFrom,
        to: square,
        promotion: 'q',
      });

      if (!move) {
        // If move failed, check if we clicked another piece of our color
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          setMoveFrom(square);
          getMoveOptions(square);
        } else {
          setMoveFrom(null);
          setOptionSquares({});
        }
      }
      return;
    }

    // 2. Select a piece to move
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setMoveFrom(square);
      getMoveOptions(square);
    }
  }

  function resetGame() {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setMoveFrom(null);
    setOptionSquares({});
    setShowModal(false);
  }

  // Find king square for check highlighting
  const customSquareStyles = useMemo(() => {
    const styles = { ...optionSquares };
    if (isCheck) {
      const board = game.board();
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const piece = board[i][j];
          if (piece && piece.type === 'k' && piece.color === game.turn()) {
            const square = `${String.fromCharCode(97 + j)}${8 - i}` as Square;
            styles[square] = {
              backgroundColor: 'rgba(255, 0, 0, 0.5)',
              boxShadow: 'inset 0 0 10px 2px rgba(255, 0, 0, 0.7)',
            };
          }
        }
      }
    }
    return styles;
  }, [isCheck, game, optionSquares]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen p-4 lg:p-8 gap-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* --- Left Sidebar: Player Info & Status --- */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6 order-2 lg:order-1 self-stretch">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse-fast transition-all duration-300",
                game.turn() === 'w' ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" : "bg-slate-700"
              )} />
              <h2 className="text-xl font-black tracking-tight uppercase italic overflow-hidden">
                Match Stats
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30 backdrop-blur-sm">
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest leading-none">Whose Turn?</span>
                <span className="font-black text-white text-lg tracking-tight">{turn}</span>
              </div>
              
              <div className={cn(
                "flex justify-between items-center p-4 rounded-2xl border transition-all duration-500",
                isCheck 
                  ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
                  : "bg-slate-800/40 border-slate-700/30 text-slate-500"
              )}>
                <span className="font-bold uppercase text-[10px] tracking-widest leading-none">King Status</span>
                <span className="font-black flex items-center gap-2 text-lg tracking-tight leading-none uppercase">
                  {isCheck && <ShieldCheck className="w-5 h-5 animate-bounce" />}
                  {isCheck ? "CHECK" : "Safe"}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={resetGame}
            className="w-full mt-12 flex items-center justify-center gap-3 py-5 px-6 bg-slate-100 text-slate-950 font-black rounded-2xl hover:bg-white transition-all transform active:scale-95 shadow-xl uppercase tracking-widest"
          >
            <RotateCcw className="w-5 h-5" />
            New Game
          </button>
        </div>

        <div className="hidden lg:block bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Info className="w-12 h-12" />
          </div>
          <p className="italic text-slate-400 text-sm leading-relaxed relative z-10 font-medium">
            "Chess helps you to concentrate, improve your logic. It teaches you to play by the rules and take responsibility for your actions, how to problem solve in an uncertain environment."
          </p>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 relative z-10">
            — Garry Kasparov
          </p>
        </div>
      </div>

      {/* --- Center: Chess Board --- */}
      <div className="w-full max-w-[580px] lg:w-1/2 aspect-square order-1 lg:order-2 relative group flex items-center justify-center">
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-[2rem] blur-[40px] opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-slate-900 p-2 lg:p-3 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] border border-slate-800/50 w-full">
          <Chessboard
            id="MultiplayerBoard"
            position={game.fen()}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            customSquareStyles={customSquareStyles}
            customBoardStyle={{
              borderRadius: '8px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
            }}
            customDarkSquareStyle={{ backgroundColor: '#1e293b' }}
            customLightSquareStyle={{ backgroundColor: '#334155' }}
            animationDuration={200}
          />
        </div>
      </div>

      {/* --- Right Sidebar: Move History --- */}
      <div className="w-full lg:w-1/4 h-[400px] lg:h-[600px] order-3 self-stretch">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl h-full flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-slate-500" />
              <h3 className="font-black uppercase italic tracking-tight">Timeline</h3>
            </div>
            <span className="text-[10px] font-black bg-slate-800 px-3 py-1 rounded-full text-slate-500 uppercase">
              {moveHistory.length} Moves
            </span>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
              <div key={i} className="flex items-stretch gap-2 transition-all duration-300">
                <div className="flex-none w-8 flex items-center justify-center text-[10px] font-black text-slate-600 font-mono">
                  {(i + 1).toString().padStart(2, '0')}
                </div>
                
                {/* White Move */}
                <div className="flex-1 p-3 rounded-2xl bg-slate-800/30 border border-slate-700/20 flex items-center gap-3 group cursor-default hover:bg-slate-800/50 transition-colors">
                  <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-900">W</div>
                  <span className="font-black text-white text-sm tracking-tight">{moveHistory[i * 2]?.san}</span>
                </div>

                {/* Black Move */}
                <div className={cn(
                  "flex-1 p-3 rounded-2xl border flex items-center gap-3 group cursor-default transition-all duration-300",
                  moveHistory[i * 2 + 1] 
                    ? "bg-slate-900/50 border-slate-700/20 hover:bg-slate-900" 
                    : "bg-transparent border-dashed border-slate-800 opacity-20"
                )}>
                  {moveHistory[i * 2 + 1] ? (
                    <>
                      <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] font-black text-white">B</div>
                      <span className="font-black text-white text-sm tracking-tight">{moveHistory[i * 2 + 1]?.san}</span>
                    </>
                  ) : (
                    <div className="w-full h-4" />
                  )}
                </div>
              </div>
            ))}
            
            {moveHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-slate-700 gap-4 opacity-50">
                <History className="w-12 h-12 stroke-[1px]" />
                <p className="text-[10px] font-black tracking-[0.3em] uppercase">Awaiting Open</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-950/40 border-t border-slate-800/50 flex justify-center gap-4">
             <button className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all active:scale-95"><ChevronLeft className="w-6 h-6"/></button>
             <button className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all active:scale-95"><ChevronRight className="w-6 h-6"/></button>
          </div>
        </div>
      </div>

      {/* --- Game Over Modal --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md transition-opacity duration-500">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-[2.5rem] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.9)] max-w-sm w-full text-center space-y-8 scale-in-center overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div className="w-24 h-24 bg-yellow-500/10 rounded-[2rem] flex items-center justify-center mx-auto ring-4 ring-yellow-500/10 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                {status === 'checkmate' ? 'Checkmate' : 'Game Over'}
              </h2>
              <p className="text-slate-400 font-medium px-4">
                {status === 'checkmate' 
                  ? `${game.turn() === 'w' ? 'Black Team' : 'White Team'} has claimed total victory.`
                  : "The tactical encounter has concluded in a stalemate."}
              </p>
            </div>

            <div className="pt-4">
              <button 
                onClick={resetGame}
                className="w-full py-5 px-8 bg-slate-100 text-slate-950 font-black rounded-2xl hover:bg-white transition-all transform active:scale-95 shadow-xl uppercase tracking-[0.2em] text-sm"
              >
                Rematch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
