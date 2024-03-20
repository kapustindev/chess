import { ASCII_A, BOARD_SIZE, CELL_QTY } from "../constants";
import { Bishop, King, Knight, Pawn, Piece, Queen, Rook } from "./pieces";
import { Maybe } from "../utilityTypes";
import { EPlayer } from "./types";

class Board {
    board: Maybe<Piece>[]
    moves: number[][];

    constructor() {
        this.board = [];
        this.moves = [];
    }

    getMoves() {
        return this.moves;
    }

    getValueFromCell(cell: number) {
        return this.board[cell];
    }

    setValueToCell(cell: number, val: Maybe<Piece>) {
        const opponent = this.board[cell];

        if (val) {
            val.setPosition(cell);
        }
        this.board[cell] = val;

        return opponent;
    }

    initBoard() {
        for (let i = 0; i < CELL_QTY; i += 1) {
            if (i > 47 && i < 56) {
                this.board.push(new Pawn(EPlayer.White, i))
            } else if (i > 7 && i < 16) {
                this.board.push(new Pawn(EPlayer.Black, i))
            } else if (i === 56 || i === 63) {
                this.board.push(new Rook(EPlayer.White, i))
            } else if (i === 0 || i === 7) {
                this.board.push(new Rook(EPlayer.Black, i))
            } else if (i === 57 || i === 62) {
                this.board.push(new Knight(EPlayer.White, i))
            } else if (i === 1 || i === 6) {
                this.board.push(new Knight(EPlayer.Black, i))
            } else if (i === 58 || i === 61) {
                this.board.push(new Bishop(EPlayer.White, i))
            } else if (i === 2 || i === 5) {
                this.board.push(new Bishop(EPlayer.Black, i))
            } else if (i === 60) {
                this.board.push(new King(EPlayer.White, i))
            } else if (i === 4) {
                this.board.push(new King(EPlayer.Black, i))
            } else if (i === 59) {
                this.board.push(new Queen(EPlayer.White, i))
            } else if (i === 3) {
                this.board.push(new Queen(EPlayer.Black, i))
            } else {
                this.board.push(null);
            }
        }
    }

    convertToAlgebraicNotation(idx: number) {
        const letter = idx % BOARD_SIZE;
        const number = BOARD_SIZE - Math.floor(idx / BOARD_SIZE);

        return String.fromCharCode(letter + ASCII_A) + number;
    }
}

export default Board;
