import {EPlayer, GameStatus} from "./types";
import Board from "./Board";
import intersection from "lodash/fp/intersection";
import {difference} from "lodash";

class Game {
    status: GameStatus;
    player: EPlayer;
    move: number;

    constructor() {
        this.status = "IN_PROGRESS";
        this.player = EPlayer.White
        this.move = 1
    }

    getPlayer() {
        return this.player;
    }
    setPlayer(opponent: EPlayer) {
        this.player = opponent;
    }
    getMove() {
        return this.move;
    }
    incMove() {
        this.move += 1;
    }

    getStatus() {
        return this.status;
    }

    setStatus(newStatus: GameStatus) {
        this.status = newStatus;
    }

    makeMove(board: Board, start: number, destination: number) {
        const piece = board.getValueFromCell(start);

        if (piece) {
            board.setValueToCell(piece.getPosition(), null);
        }

        const opponent = board.setValueToCell(destination, piece);

        const [isCheck] = this.checkForCheck(board);

        if (this.getStatus() != "IN_PROGRESS") {
            console.log("The game is over");
            return false;
        }

        if (isCheck) {
            board.setValueToCell(start, piece);
            board.setValueToCell(destination, opponent);
            return false;
        }

        return true;
    }

    endTurn() {
        this.setPlayer(this.player === EPlayer.White ? EPlayer.Black : EPlayer.White);
    }

    checkForCheck(board: Board) {
        const opponentColor = this.player === EPlayer.White ? EPlayer.Black : EPlayer.White;
        const possibleOpponentMoves: Map<number, number[][]> = new Map();
        const possiblePlayerMoves: Map<number, number[]> = new Map();

        let kingMoves;
        let kingPosition = 0;
        let isCheck = false;

        for (let cell = 0; cell < board.board.length; cell += 1) {
            const piece = board.getValueFromCell(cell);

            if (piece) {
                if (piece.getColor() === opponentColor) {
                    possibleOpponentMoves.set(cell, piece.getMoves(board, true));
                } else {
                    if (piece.getType() === "king") {
                        kingPosition = piece.getPosition();
                        kingMoves = piece.getMoves(board);
                    } else {
                        possiblePlayerMoves.set(cell, piece.getMoves(board));
                    }
                }
            }
        }

        const attackPaths: number[][] = [];
        const flatPossibleOpponentMoves: number[] = [];

        possibleOpponentMoves.forEach((moveSlices, cell) => {
            flatPossibleOpponentMoves.push(...moveSlices.flat());
            for (const slice of moveSlices) {
                for (const move of slice) {
                    if (kingPosition === move) {
                        attackPaths.push([cell, ...slice])
                        isCheck = true;
                    }
                }
            }
        })

        const possibleKingMoves = difference(kingMoves, flatPossibleOpponentMoves);

        if (attackPaths.length === 1) {
            let i = 0;

            possiblePlayerMoves.forEach((moves) => {
                if (intersection(attackPaths[0], moves).length > 0) {
                    i += 1;
                }
            })

            if (i == 0 && possibleKingMoves.length == 0) {
                const winner = this.player == EPlayer.White ? "BLACK_WON" : "WHITE_WON"
                this.setStatus(winner);
            }
        }

        return [isCheck, kingPosition] as const;
    }
}

export default Game;
