import {EPlayer, GameStatus} from "./types";
import Board from "./Board";
import intersection from "lodash/fp/intersection";
import {difference} from "lodash";

class Game {
    status: GameStatus;
    player: EPlayer;
    moves: number[][];

    constructor() {
        this.status = "IN_PROGRESS";
        this.player = EPlayer.White
        this.moves = []
    }

    getPlayer() {
        return this.player;
    }
    setPlayer(opponent: EPlayer) {
        this.player = opponent;
    }
    getMoves() {
        return this.moves;
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

        this.moves.push([start, destination])

        return true;
    }

    endTurn() {
        this.setPlayer(this.player === EPlayer.White ? EPlayer.Black : EPlayer.White);
    }

   private isCastlingPossible(board: Board, type: "king" | "queen") {
        const kingStartingPosition = this.player == EPlayer.White ? 60 : 4;
        const didKingMove = Boolean(this.moves.find(move => move.includes(kingStartingPosition)));

        if (type === "king") {
            return isCastlingValid(kingStartingPosition + 3, this.moves, 1);
        } else {
            return isCastlingValid(kingStartingPosition - 4, this.moves, -1);
        }

        function isCastlingValid(rookPos: number, moves: number[][], direction: number) {
            const didRookMove = Boolean(moves.find(move => move.includes(rookPos)));

            if (didKingMove || didRookMove) {
                return false;
            }

            const king = board.getValueFromCell(kingStartingPosition)!;

            return king._getHorizontalMoves(board, direction).includes(rookPos - direction);
        }
    }

    checkForCheck(board: Board) {
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

        if (attackPaths.length === 1) {
            let i = 0;

            for (const moves of Object.values(possiblePlayerMoves)) {
                if (intersection(attackPaths[0], moves).length > 0) {
                    i += 1;
                }
            }

            if (i == 0 && possibleKingMoves.length == 0) {
                const winner = this.player == EPlayer.White ? "BLACK_WON" : "WHITE_WON"
                this.setStatus(winner);
            }
        }

        return [isCheck, kingPosition] as const;
    }
}

export default Game;
