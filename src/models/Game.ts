import {EPlayer, GameStatus} from "./types";
import Board from "./Board";
import {Piece} from "./pieces";

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
        const allPossibleMoves: Map<Piece, number[]> = new Map();
        let kingPosition = 0;
        let isCheck = false;

        for (let cell = 0; cell < board.board.length; cell += 1) {
            const piece = board.getValueFromCell(cell);
            if (piece) {
                if (piece.getColor() === opponentColor) {
                    allPossibleMoves.set(piece, piece.getMoves(board));
                } else {
                    if (piece.getType() === "king") {
                        kingPosition = piece.getPosition();
                    }
                }
            }
        }

        allPossibleMoves.forEach((moves, piece) => {
            for (const move of moves) {
                if (kingPosition === move) {
                    isCheck = true;
                }
            }
        })

        return [isCheck, kingPosition] as const;
    }
}

export default Game;
