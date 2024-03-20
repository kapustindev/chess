export enum EPlayer {
  White = "white",
  Black = "black"
}

export type UPiece = "piece" | "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

export type GameStatus = "WHITE_WON" | "BLACK_WON" | "IN_PROGRESS";

export enum EDirection {
  Positive = 1,
  Negative = -1
}

export enum EMoveType {
  Default = 2,
  EnPassant = 3,
  KingSideCastling = 4,
  QueenSideCastling = 5
}