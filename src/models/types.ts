export enum EPlayer {
  White = "white",
  Black = "black"
}

export type UPiece = "piece" | "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

export type UCastlingType = "queen" | "king";

export type GameStatus = "WHITE_WON" | "BLACK_WON" | "IN_PROGRESS";

export enum EDirection {
  Positive = 1,
  Negative = -1
}