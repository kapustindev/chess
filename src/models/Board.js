import { ASCII_A, BOARD_SIZE, CELL_QTY } from "../constants";
import { Bishop, King, Knight, Pawn, Queen, Rook } from "./pieces";

function Board() {
    this.board = [];

    this.getValueFromCell = function(cell) {
        return this.board[cell];
    }

    this.setValueToCell = function(cell, val) {
        if (val) {
            val.setPosition(cell);
        }
        this.board[cell] = val;
    }

    this.initBoard = function() {
        for (let i = 0; i < CELL_QTY; i += 1) {
            if (i > 47 && i < 56) {
                this.board.push(new Pawn("white", i))
            } else if (i > 7 && i < 16) {
                this.board.push(new Pawn("black", i))
            } else if (i === 56 || i === 63) {
                this.board.push(new Rook("white", i))
            } else if (i === 0 || i === 7) {
                this.board.push(new Rook("black", i))
            } else if (i === 57 || i === 62) {
                this.board.push(new Knight("white", i))
            } else if (i === 1 || i === 6) {
                this.board.push(new Knight("black", i))
            } else if (i === 58 || i === 61) {
                this.board.push(new Bishop("white", i))
            } else if (i === 2 || i === 5) {
                this.board.push(new Bishop("black", i))
            } else if (i === 60) {
                this.board.push(new King("white", i))
            } else if (i === 4) {
                this.board.push(new King("black", i))
            } else if (i === 59) {
                this.board.push(new Queen("white", i))
            } else if (i === 3) {
                this.board.push(new Queen("black", i))
            } else {
                this.board.push(null);
            }
        }
    }

    this.convertToAlgebraicNotation = function(idx) {
        const letter = idx % BOARD_SIZE;
        const number = BOARD_SIZE - Math.floor(idx / BOARD_SIZE);

        return String.fromCharCode(letter + ASCII_A) + number;
    }
}

export default Board;