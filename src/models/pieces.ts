import {BOARD_SIZE, CELL_QTY} from "../constants";
import {EDirection, EPlayer, UPiece} from "./types";
import Board from "./Board";

export class Piece {
    color: EPlayer;
    position: number;
    type: UPiece

    constructor(color: EPlayer, position: number) {
        this.color = color;
        this.position = position;
        this.type = "piece";
    }

    getColor() {
        return this.color;
    }

    getPosition() {
        return this.position;
    }

    setPosition(pos: number) {
        this.position = pos;
    }

    getType() {
        return this.type;
    }

    isHomeRank() {
        return (this.color === "white" && this.position > 47 && this.position < 56)
            || (this.color === "black" && this.position > 7 && this.position < 16);
    }

    getMoves(board: Board): number[] {
        return [];
    }

    _getHorizontalMoves = (board: Board, direction: EDirection, range = BOARD_SIZE) => {
        const moves: number[] = [];

        if (((this.position + 1) % BOARD_SIZE === 0 && direction === EDirection.Positive)
            || (this.position % BOARD_SIZE === 0 && direction === EDirection.Negative)) {
            return moves;
        }

        let move = this.position + direction;

        while ((direction === EDirection.Positive ? move % BOARD_SIZE : (move + 1) % BOARD_SIZE) && move >= 0 && move < CELL_QTY && range > 0) {
            const piece = board.getValueFromCell(move);

            if (piece) {
                if (piece.getColor() !== this.getColor()) {
                    moves.push(move);
                }
                break;
            }
            moves.push(move);
            move += direction;
            range -= 1
        }

        return moves;
    }

    _getVerticalMoves = (board: Board, direction: EDirection, range = BOARD_SIZE) => {
        const moves: number[] = [];
        const step = direction * BOARD_SIZE;

        for (let i = this.position + step; direction === EDirection.Negative ? i >= 0 : i < CELL_QTY; i += step) {
            if (range <= 0) {
                break;
            }

            if (i % BOARD_SIZE === (this.position % BOARD_SIZE)) {
                moves.push(i);
            }

            range -= 1;
        }
        const pieceInThePathIdx = moves.find(move => board.getValueFromCell(move));

        if (pieceInThePathIdx !== undefined) {
            const pieceInThePath = board.getValueFromCell(pieceInThePathIdx);

            if (pieceInThePath) {
                const pieceIdx = moves.indexOf(pieceInThePathIdx);
                return moves.slice(0, pieceInThePath.getColor() !== this.color ? pieceIdx + 1 : pieceIdx);
            }
        }

        return moves;

    }

    _getDiagonalMoves = (board: Board, range = BOARD_SIZE) => {
        const moves: number[] = [];

        const possibleDirections = [-7, 7, -9, 9]

        possibleDirections.forEach(add => {
            let move = this.position;
            let directionRange = range;

            if (((move + 1) % BOARD_SIZE === 0 && (add === -7 || add === 9))
                || (move % BOARD_SIZE === 0 && (add === 7 || add === -9))) {
                return;
            }

            move += add;

            while (move >= 0 && move < CELL_QTY && directionRange > 0) {
                const piece = board.getValueFromCell(move)

                if (piece) {
                    if (piece.getColor() !== this.getColor()) {
                        moves.push(move);
                    }
                    break;
                }
                moves.push(move);
                move += add;
                directionRange -= 1;
            }
        })

        return moves;
    }
}

export class Pawn extends Piece {
    direction: EDirection

    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "pawn";
        this.direction = color === EPlayer.White ? EDirection.Positive : EDirection.Negative;
    }

    getMoves(board: Board) {
        const verticalMoves = [this.position - (8 * this.direction)];

        if (this.isHomeRank()) {
            verticalMoves.push(this.position - (16 * this.direction));
        }

        const pieceInThePath = verticalMoves.find(move => board.getValueFromCell(move));

        const correctVerticalMoves = verticalMoves.slice(pieceInThePath);

        const diagonalMoves = [this.position - (7 * this.direction), this.position - (9 * this.direction)];

        const correctDiagonalMoves = diagonalMoves.filter(move => {
            const piece = board.getValueFromCell(move);

            if (piece) {
                return piece.getColor() !== this.getColor();
            }
            return false;
        })

        return correctDiagonalMoves.concat(correctVerticalMoves);
    }
}

export class Rook extends Piece {
    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "rook";
    }

    getMoves(board: Board) {
        return this._getVerticalMoves(board, -1)
            .concat(this._getVerticalMoves(board, 1))
            .concat(this._getHorizontalMoves(board, 1))
            .concat(this._getHorizontalMoves(board,-1));
    }
}

export class Knight extends Piece {
    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "knight";
    }

    // BUG WITH A/B OR G/H columns
    getMoves(board: Board) {
        const moves: number[] = [];
        const cellsToAdd = [6, 10, 15, 17];

        for (const value of cellsToAdd) {
            const twoMoves = [this.position + value, this.position - value];

            twoMoves.forEach(move => {
                if (move < 0 || move >= CELL_QTY) {
                    return;
                }

                const piece = board.getValueFromCell(move)

                if (piece && piece.getColor() === this.getColor()) {
                    return;
                }

                moves.push(move);
            })
        }

        return moves;
    }
}

export class Bishop extends Piece {
    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "bishop";
    }

    getMoves(board: Board) {
        return this._getDiagonalMoves(board);
    }
}

export class King extends Piece {
    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "king";
    }

    getMoves(board: Board) {
        return this._getDiagonalMoves(board, 1)
            .concat(this._getVerticalMoves(board, -1, 1))
            .concat(this._getVerticalMoves(board, 1, 1))
            .concat(this._getHorizontalMoves(board, 1, 1))
            .concat(this._getHorizontalMoves(board,-1, 1));
    }
}

export class Queen extends Piece {
    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "queen";
    }

    getMoves(board: Board) {
        return this._getDiagonalMoves(board)
            .concat(this._getVerticalMoves(board, -1))
            .concat(this._getVerticalMoves(board, 1))
            .concat(this._getHorizontalMoves(board, 1))
            .concat(this._getHorizontalMoves(board,-1));
    }
}
