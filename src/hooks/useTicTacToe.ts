import { useState, useEffect, useCallback } from 'react';
import {
  Player,
  Scores,
  LOCAL_STORAGE_KEY,
  WINNING_LINES,
  PieceSize,
  CellStack,
  PlayerSupplies,
  SIZE_VALUES,
  Supply,
  Piece
} from '../constants';

export interface MoveAction {
  type: 'place';
  size: PieceSize;
  to: number;
}

export interface MoveMove {
  type: 'move';
  from: number;
  to: number;
}

export type Action = MoveAction | MoveMove;

// Helper to calculate all legal moves for a given player
export const getLegalMoves = (currentBoard: CellStack[], currentSupply: Supply, player: Player): Action[] => {
  const legal: Action[] = [];

  // 1. Placement options
  const sizes: PieceSize[] = ['S', 'M', 'L'];
  for (const size of sizes) {
    if (currentSupply[size] > 0) {
      const sizeVal = SIZE_VALUES[size];
      for (let to = 0; to < 9; to++) {
        const stack = currentBoard[to];
        if (stack.length === 0) {
          legal.push({ type: 'place', size, to });
        } else {
          const top = stack[stack.length - 1];
          if (sizeVal > SIZE_VALUES[top.size]) {
            legal.push({ type: 'place', size, to });
          }
        }
      }
    }
  }

  // 2. Movement options
  for (let from = 0; from < 9; from++) {
    const stackFrom = currentBoard[from];
    if (stackFrom.length > 0) {
      const topFrom = stackFrom[stackFrom.length - 1];
      if (topFrom.player === player) {
        const sizeVal = SIZE_VALUES[topFrom.size];
        for (let to = 0; to < 9; to++) {
          if (from === to) continue;
          const stackTo = currentBoard[to];
          if (stackTo.length === 0) {
            legal.push({ type: 'move', from, to });
          } else {
            const topTo = stackTo[stackTo.length - 1];
            if (sizeVal > SIZE_VALUES[topTo.size]) {
              legal.push({ type: 'move', from, to });
            }
          }
        }
      }
    }
  }

  return legal;
};

export function useTicTacToe() {
  const [board, setBoard] = useState<CellStack[]>(() => Array(9).fill(null).map(() => []));
  const [supply, setSupply] = useState<PlayerSupplies>({
    X: { L: 2, M: 2, S: 2 },
    O: { L: 2, M: 2, S: 2 }
  });
  const [selected, setSelected] = useState<{ source: 'supply' | 'board'; size?: PieceSize; index?: number } | null>(null);
  const [xIsNext, setXIsNext] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [scores, setScores] = useState<Scores>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : { X: 0, O: 0, draws: 0 };
  });

  // History tracking for Chrono-Shift (Undo)
  const [history, setHistory] = useState<{ board: CellStack[]; supply: PlayerSupplies; xIsNext: boolean; aiReason: string | null }[]>(() => [
    {
      board: Array(9).fill(null).map(() => []),
      supply: { X: { L: 2, M: 2, S: 2 }, O: { L: 2, M: 2, S: 2 } },
      xIsNext: true,
      aiReason: null
    }
  ]);
  const [historyStep, setHistoryStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [aiReason, setAiReason] = useState<string | null>(null);

  const checkWinner = (currentBoard: CellStack[], currentSupply: PlayerSupplies, currentXIsNext: boolean) => {
    const topBoard = currentBoard.map(stack => stack.length > 0 ? stack[stack.length - 1].player : null);
    
    const xWins: number[][] = [];
    const oWins: number[][] = [];
    
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      if (topBoard[a] && topBoard[a] === topBoard[b] && topBoard[a] === topBoard[c]) {
        if (topBoard[a] === 'X') {
          xWins.push(line);
        } else {
          oWins.push(line);
        }
      }
    }

    if (xWins.length > 0 && oWins.length > 0) {
      // If both won, the player who just moved wins.
      // (If currentXIsNext is false, X just moved, so X wins. Else O wins.)
      return !currentXIsNext ? { winner: 'X' as const, line: xWins[0] } : { winner: 'O' as const, line: oWins[0] };
    }

    if (xWins.length > 0) {
      return { winner: 'X' as const, line: xWins[0] };
    }
    if (oWins.length > 0) {
      return { winner: 'O' as const, line: oWins[0] };
    }

    // Check draw: if the active player has zero legal moves
    const activePlayer = currentXIsNext ? 'X' : 'O';
    const activeSupply = currentSupply[activePlayer];
    const legal = getLegalMoves(currentBoard, activeSupply, activePlayer);
    if (legal.length === 0) {
      return { winner: 'draw' as const, line: null };
    }

    return null;
  };

  const gameInfo = checkWinner(board, supply, xIsNext);
  const winner = gameInfo?.winner;
  const winningLine = gameInfo?.line;

  const activeLegalMoves = getLegalMoves(board, supply.X, 'X');

  // Clear API error automatically after 3.5 seconds
  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => {
        setApiError(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  const handleAIMove = useCallback(async (currentBoard: CellStack[], currentSupply: PlayerSupplies) => {
    if (winner) return;
    
    setIsThinking(true);
    try {
      const response = await fetch('/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: currentBoard, supply: currentSupply }),
      });
      
      const data = await response.json();
      
      if (data.action) {
        const act = data.action;
        const newBoard = currentBoard.map(stack => [...stack]);
        const newSupply = { X: { ...currentSupply.X }, O: { ...currentSupply.O } };

        if (act.type === 'place') {
          newBoard[act.to].push({ player: 'O', size: act.size });
          newSupply.O[act.size]--;
        } else if (act.type === 'move') {
          const movingPiece = newBoard[act.from].pop()!;
          newBoard[act.to].push(movingPiece);
        }

        const nextHistory = [
          ...history.slice(0, historyStep + 1),
          { board: newBoard, supply: newSupply, xIsNext: true, aiReason: data.reason || null }
        ];

        setBoard(newBoard);
        setSupply(newSupply);
        setHistory(nextHistory);
        setHistoryStep(nextHistory.length - 1);
        setXIsNext(true);
        setAiReason(data.reason || null);
      } else {
        throw new Error("Invalid AI action");
      }
    } catch (error) {
      console.error('AI Move failed:', error);
      setApiError('AI_CONN_LOST: Local backup subroutines active.');
      
      // Fallback: random selection
      const legal = getLegalMoves(currentBoard, currentSupply.O, 'O');
      if (legal.length > 0) {
        const act = legal[Math.floor(Math.random() * legal.length)];
        const newBoard = currentBoard.map(stack => [...stack]);
        const newSupply = { X: { ...currentSupply.X }, O: { ...currentSupply.O } };

        if (act.type === 'place') {
          newBoard[act.to].push({ player: 'O', size: act.size });
          newSupply.O[act.size]--;
        } else if (act.type === 'move') {
          const movingPiece = newBoard[act.from].pop()!;
          newBoard[act.to].push(movingPiece);
        }

        const nextHistory = [
          ...history.slice(0, historyStep + 1),
          { board: newBoard, supply: newSupply, xIsNext: true, aiReason: '통신 지연으로 자체 로컬 알고리즘을 진행했어요! 🤖' }
        ];

        setBoard(newBoard);
        setSupply(newSupply);
        setHistory(nextHistory);
        setHistoryStep(nextHistory.length - 1);
        setXIsNext(true);
        setAiReason('통신 지연으로 자체 로컬 알고리즘을 진행했어요! 🤖');
      }
    } finally {
      setIsThinking(false);
    }
  }, [winner, historyStep, history]);

  useEffect(() => {
    if (winner) {
      const newScores = { ...scores };
      if (winner === 'X') newScores.X += 1;
      else if (winner === 'O') newScores.O += 1;
      else if (winner === 'draw') newScores.draws += 1;
      
      setScores(newScores);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newScores));
    }
  }, [winner]);

  // Trigger AI move when it's O's turn
  useEffect(() => {
    if (!xIsNext && !winner && !isThinking) {
      handleAIMove(board, supply);
    }
  }, [xIsNext, winner, board, supply, handleAIMove, isThinking]);

  const handleClick = (i: number) => {
    if (winner || isThinking || !xIsNext) return;

    const topPiece = board[i][board[i].length - 1];

    if (selected) {
      const isLegal = activeLegalMoves.some(m => {
        if (selected.source === 'supply') {
          return m.type === 'place' && m.size === selected.size && m.to === i;
        } else {
          return m.type === 'move' && m.from === selected.index && m.to === i;
        }
      });

      if (isLegal) {
        const newBoard = board.map(stack => [...stack]);
        const newSupply = { X: { ...supply.X }, O: { ...supply.O } };

        if (selected.source === 'supply' && selected.size) {
          newBoard[i].push({ player: 'X', size: selected.size });
          newSupply.X[selected.size]--;
        } else if (selected.source === 'board' && selected.index !== undefined) {
          const movingPiece = newBoard[selected.index].pop()!;
          newBoard[i].push(movingPiece);
        }

        const nextHistory = [
          ...history.slice(0, historyStep + 1),
          { board: newBoard, supply: newSupply, xIsNext: false, aiReason: null }
        ];

        setBoard(newBoard);
        setSupply(newSupply);
        setHistory(nextHistory);
        setHistoryStep(nextHistory.length - 1);
        setSelected(null);
        setXIsNext(false);
        return;
      }
    }

    // Try selecting top board piece of X
    if (topPiece && topPiece.player === 'X') {
      setSelected({ source: 'board', index: i });
    } else {
      setSelected(null);
    }
  };

  const selectSupplyPiece = (size: PieceSize) => {
    if (winner || isThinking || !xIsNext) return;
    if (supply.X[size] <= 0) return;

    if (selected?.source === 'supply' && selected.size === size) {
      setSelected(null);
    } else {
      setSelected({ source: 'supply', size });
    }
  };

  const chronoShift = () => {
    if (historyStep < 2 || isThinking || winner) return;

    const targetStep = historyStep - 2;
    const targetState = history[targetStep];
    
    setHistoryStep(targetStep);
    setBoard(targetState.board);
    setSupply(targetState.supply);
    setXIsNext(true);
    setAiReason(targetState.aiReason);
    setSelected(null);
    setApiError(null);
  };

  const resetGame = () => {
    const freshBoard = Array(9).fill(null).map(() => []);
    const freshSupply = { X: { L: 2, M: 2, S: 2 }, O: { L: 2, M: 2, S: 2 } };
    setBoard(freshBoard);
    setSupply(freshSupply);
    setHistory([{ board: freshBoard, supply: freshSupply, xIsNext: true, aiReason: null }]);
    setHistoryStep(0);
    setXIsNext(true);
    setAiReason(null);
    setSelected(null);
    setApiError(null);
  };

  const clearScores = () => {
    const freshScores = { X: 0, O: 0, draws: 0 };
    setScores(freshScores);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(freshScores));
  };

  return {
    board,
    supply,
    selected,
    xIsNext,
    isThinking,
    scores,
    winner,
    winningLine,
    historyStep,
    apiError,
    aiReason,
    handleClick,
    selectSupplyPiece,
    chronoShift,
    resetGame,
    clearScores,
    activeLegalMoves,
  };
}
