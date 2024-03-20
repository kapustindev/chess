import { UCastlingType } from "./models/types";

export function getCastlingTextContent(type: UCastlingType) {
  return type == "king" ? "O-O" : "O-O-O";
}
