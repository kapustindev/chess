import {BOARD_SIZE, CELL_QTY} from "../constants";

class Piece {
    constructor(color, position) {
        this.color = color;
        this.position = position;
        this.type = "piece";
    }

    getColor = function () {
        return this.color;
    }

    getPosition = function () {
        return this.position;
    }

    setPosition = function (pos) {
        this.position = pos;
    }

    getType = function () {
        return this.type;
    }

    isHomeRank = function() {
        return (this.color === "white" && this.position > 47 && this.position < 56)
            || (this.color === "black" && this.position > 7 && this.position < 16);
    }

    _getHorizontalMoves = (board, direction, range = BOARD_SIZE) => {
        const moves = [];

        if (((this.position + 1) % BOARD_SIZE === 0 && direction === 1)
            || (this.position % BOARD_SIZE === 0 && direction === -1)) {
            return moves;
        }

        let move = this.position + direction;

        while ((direction === 1 ? move % BOARD_SIZE : (move + 1) % BOARD_SIZE) && move >= 0 && move < CELL_QTY && range > 0) {
            if (board.getValueFromCell(move)) {
                if (board.getValueFromCell(move).getColor() !== this.getColor()) {
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

    _getVerticalMoves = (board, direction, range = BOARD_SIZE) => {
        const moves = [];
        const step = direction * BOARD_SIZE;

        for (let i = this.position + step; direction === -1 ? i >= 0 : i < CELL_QTY; i += step) {
            if (range <= 0) {
                break;
            }

            if (i % BOARD_SIZE === (this.position % BOARD_SIZE)) {
                moves.push(i);
            }

            range -= 1;
        }
        const pieceInThePath = moves.find(move => board.getValueFromCell(move));

        if (!pieceInThePath) {
            return moves;
        }

        const pieceIdx = moves.indexOf(pieceInThePath);

        return moves.slice(0, board.getValueFromCell(pieceInThePath).getColor() !== this.color ? pieceIdx + 1 : pieceIdx);
    }

    _getDiagonalMoves = function(board, range = BOARD_SIZE) {
        const moves = [];

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

                if (board.getValueFromCell(move)) {
                    if (board.getValueFromCell(move).getColor() !== this.getColor()) {
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
    constructor(color, position) {
        super(color, position);
        this.type = "pawn";
        this.direction = color === "white" ? 1 : -1;
    }

    getMoves = function (board) {
        const verticalMoves = [this.position - (8 * this.direction)];

        if (this.isHomeRank()) {
            verticalMoves.push(this.position - (16 * this.direction));
        }

        const pieceInThePath = verticalMoves.find(move => board.getValueFromCell(move));

        const correctVerticalMoves = verticalMoves.slice(pieceInThePath);

        const diagonalMoves = [this.position - (7 * this.direction), this.position - (9 * this.direction)];

        const correctDiagonalMoves = diagonalMoves.filter(move => {
            if (board.getValueFromCell(move)) {
                return board.getValueFromCell(move).getColor() !== this.getColor();
            }
            return false;
        })

        return correctDiagonalMoves.concat(correctVerticalMoves);
    }
}

export class Rook extends Piece {
    constructor(color, position) {
        super(color, position);
        this.type = "rook";
    }

    getMoves = function(board) {
        return this._getVerticalMoves(board, -1)
            .concat(this._getVerticalMoves(board, 1))
            .concat(this._getHorizontalMoves(board, 1))
            .concat(this._getHorizontalMoves(board,-1));
    }
}

export class Knight extends Piece {
    constructor(color, position) {
        super(color, position);
        this.type = "knight";
    }

    // BUG WITH A/B OR G/H columns
    getMoves = function (board) {
        const moves = [];
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
    constructor(color, position) {
        super(color, position);
        this.type = "bishop";
    }

    getMoves = function(board) {
        return this._getDiagonalMoves(board);
    }
}

export class King extends Piece {
    constructor(color, position) {
        super(color, position);
        this.type = "king";
    }

    getMoves = function(board) {
        return this._getDiagonalMoves(board, 1)
            .concat(this._getVerticalMoves(board, -1, 1))
            .concat(this._getVerticalMoves(board, 1, 1))
            .concat(this._getHorizontalMoves(board, 1, 1))
            .concat(this._getHorizontalMoves(board,-1, 1));
    }
}

export class Queen extends Piece {
    constructor(color, position) {
        super(color, position);
        this.type = "queen";
    }

    getMoves = function(board) {
        return this._getDiagonalMoves(board)
            .concat(this._getVerticalMoves(board, -1))
            .concat(this._getVerticalMoves(board, 1))
            .concat(this._getHorizontalMoves(board, 1))
            .concat(this._getHorizontalMoves(board,-1));
    }
}