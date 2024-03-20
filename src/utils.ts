import { EMoveType } from "./models/types";
import Board from "./models/Board";

export function getMoveDesc(board: Board, move: number[], isCapture: boolean = false) {
  const [start, end] = move;
  const normalizedStart = board.convertToAlgebraicNotation(start);
  const normalizedEnd = board.convertToAlgebraicNotation(end);

  switch(move.length) {
    case EMoveType.EnPassant: {
      return `${normalizedStart} # ${normalizedEnd}`;
    }
    case EMoveType.KingSideCastling: {
      return "O-O";
    }
    case EMoveType.QueenSideCastling: {
      return "O-O-O";
    }
    default: {
      return `${normalizedStart} ${isCapture ? "#" : "->"} ${normalizedEnd}`;
    }
  }
}