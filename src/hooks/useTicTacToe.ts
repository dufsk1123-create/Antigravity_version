import { useState, useEffect, useCallback } from 'react';
import { Player, Scores, LOCAL_STORAGE_KEY, WINNING_LINES } from '../constants';

export function useTicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [scores, setScores] = useState<Scores>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : { X: 0, O: 0, draws: 0 };
  });

  // History tracking for Chrono-Shift (Undo)
  const [history, setHistory] = useState<Player[][]>([Array(9).fill(null)]);
  const [historyStep, setHistoryStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const checkWinner = (squares: Player[]) => {
    for (const [a, b, c] of WINNING_LINES) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }

    if (squares.every(sq => sq !== null)) {
      return { winner: 'draw' as const, line: null };
    }

    return null;
  };

  const gameInfo = checkWinner(board);
  const winner = gameInfo?.winner;
  const winningLine = gameInfo?.line;

  // Clear API error automatically after 3.5 seconds
  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => {
        setApiError(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  const handleAIMove = useCallback(async (currentBoard: Player[]) => {
    if (winner) return;
    
    setIsThinking(true);
    try {
      const response = await fetch('/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: currentBoard }),
      });
      
      const data = await response.json();
      
      if (data.move !== undefined) {
        const newBoard = [...currentBoard];
        newBoard[data.move] = 'O';
        
        setHistory(prev => {
          const next = [...prev.slice(0, historyStep + 1), newBoard];
          setHistoryStep(next.length - 1);
          return next;
        });
        
        setBoard(newBoard);
        setXIsNext(true);
      }
    } catch (error) {
      console.error('AI Move failed:', error);
      
      // Set themed glitch error message for fallback
      setApiError('AI_CONN_LOST: Local backup subroutines active.');
      
      // Fallback to random selection
      const available = currentBoard.map((v, i) => v === null ? i : null).filter((v): v is number => v !== null);
      if (available.length > 0) {
        const move = available[Math.floor(Math.random() * available.length)];
        const newBoard = [...currentBoard];
        newBoard[move] = 'O';
        
        setHistory(prev => {
          const next = [...prev.slice(0, historyStep + 1), newBoard];
          setHistoryStep(next.length - 1);
          return next;
        });
        
        setBoard(newBoard);
        setXIsNext(true);
      }
    } finally {
      setIsThinking(false);
    }
  }, [winner, historyStep]);

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
      handleAIMove(board);
    }
  }, [xIsNext, winner, board, handleAIMove, isThinking]);

  const handleClick = (i: number) => {
    if (board[i] || winner || isThinking || !xIsNext) return;

    const newBoard = [...board];
    newBoard[i] = 'X';
    
    const nextHistory = [...history.slice(0, historyStep + 1), newBoard];
    setHistory(nextHistory);
    setHistoryStep(nextHistory.length - 1);
    
    setBoard(newBoard);
    setXIsNext(false);
  };

  const chronoShift = () => {
    // Cannot rollback if there are fewer than 2 moves or if AI is calculating or game has ended
    if (historyStep < 2 || isThinking || winner) return;

    const targetStep = historyStep - 2;
    const targetBoard = history[targetStep];
    
    setHistoryStep(targetStep);
    setBoard(targetBoard);
    setXIsNext(true);
    setApiError(null);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setHistory([Array(9).fill(null)]);
    setHistoryStep(0);
    setXIsNext(true);
    setApiError(null);
  };

  const clearScores = () => {
    const freshScores = { X: 0, O: 0, draws: 0 };
    setScores(freshScores);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(freshScores));
  };

  return {
    board,
    xIsNext,
    isThinking,
    scores,
    winner,
    winningLine,
    historyStep,
    apiError,
    handleClick,
    chronoShift,
    resetGame,
    clearScores,
  };
}
