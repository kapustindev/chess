import { EPlayer, GameStatus } from "./types";
import Board from "./Board";
import intersection from "lodash/fp/intersection";
import difference from "lodash/fp/difference";
import range from "lodash/fp/range";
import { BOARD_SIZE } from "../constants";

class Game {
    status: GameStatus;
    player: EPlayer;

    constructor() {
        this.status = "IN_PROGRESS";
        this.player = EPlayer.White
    }

    getPlayer() {
        return this.player;
    }
    setPlayer(opponent: EPlayer) {
        this.player = opponent;
    }

    getStatus() {
        return this.status;
    }

    setStatus(newStatus: GameStatus) {
        this.status = newStatus;
    }

    makeMove(board: Board, start: number, destination: number) {
        const piece = board.getValueFromCell(start);

        const isCastling = piece?.getType() == "king" && Math.abs(destination % BOARD_SIZE - start % BOARD_SIZE) > 1;

        if (piece) {
            board.setValueToCell(piece.getPosition(), null);
        }

        if (isCastling) {
            const isKingside = destination > start;
            const rookPos = isKingside ? destination + 1 : destination - 2;
            const rook = board.getValueFromCell(rookPos)!;
            board.setValueToCell(isKingside ? destination - 1 : destination + 1, rook);
            board.setValueToCell(rookPos, null);
        }

        const opponent = board.setValueToCell(destination, piece);

        const [isCheck] = this.getAllMoves(board);

        if (this.getStatus() != "IN_PROGRESS") {
            console.log("The game is over");
            return false;
        }

        if (isCheck) {
            board.setValueToCell(start, piece);
            board.setValueToCell(destination, opponent);
            return false;
        }

        if (isCastling) {
            const rangeEnd = start > destination ? destination - 3 : destination + 2;
            board.moves.push(range(start, rangeEnd));
        } else {
            board.moves.push([start, destination])
        }

        return true;
    }

    endTurn() {
        this.setPlayer(this.player === EPlayer.White ? EPlayer.Black : EPlayer.White);
    }

    getAllMoves(board: Board) {
        const opponentColor = this.player === EPlayer.White ? EPlayer.Black : EPlayer.White;
        const possibleOpponentMoves: Record<number, number[][]> = {};
        const possiblePlayerMoves: Record<number, number[]> = {};

        let kingMoves;
        let kingPosition = 0;
        let isCheck = false;

        for (let cell = 0; cell < board.board.length; cell += 1) {
            const piece = board.getValueFromCell(cell);

            if (piece) {
                if (piece.getColor() === opponentColor) {
                    possibleOpponentMoves[cell] = piece.getMoves(board, true);
                } else {
                    if (piece.getType() === "king") {
                        kingPosition = piece.getPosition();
                        kingMoves = piece.getMoves(board);
                    } else {
                        possiblePlayerMoves[cell] = piece.getMoves(board);
                    }
                }
            }
        }

        const attackPaths: number[][] = [];
        const flatPossibleOpponentMoves: number[] = [];

        for (const [cell, moveSlices] of Object.entries(possibleOpponentMoves)) {
            flatPossibleOpponentMoves.push(...moveSlices.flat());

            for (const slice of moveSlices) {
                for (const move of slice) {
                    if (kingPosition === move) {
                        attackPaths.push([+cell, ...slice])
                        isCheck = true;
                    }
                }
            }
        }

        const possibleKingMoves = difference(kingMoves, flatPossibleOpponentMoves);
        const king = board.getValueFromCell(kingPosition)!;
        king.setPossibleMoves(possibleKingMoves);

        if (attackPaths.length === 1) {
            let i = 0;

            for (const moves of Object.values(possiblePlayerMoves)) {
                if (intersection(attackPaths[0], moves).length > 0) {
                    i += 1;
                }
            }

            if (i == 0 && king.getPossibleMoves().length == 0) {
                const winner = this.player == EPlayer.White ? "BLACK_WON" : "WHITE_WON"
                this.setStatus(winner);
            }
        }

        return [isCheck, kingPosition] as const;
    }
}

export default Game;
