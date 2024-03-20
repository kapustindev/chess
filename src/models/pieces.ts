import {BOARD_SIZE, CELL_QTY} from "../constants";
import {EDirection, EPlayer, UPiece} from "./types";
import Board from "./Board";

export class Piece {
    color: EPlayer;
    position: number;
    type: UPiece
    possibleMoves: number[];

    constructor(color: EPlayer, position: number) {
        this.color = color;
        this.position = position;
        this.type = "piece";
        this.possibleMoves = [];
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

    setPossibleMoves(moves: number[]) {
        this.possibleMoves = moves;
    }

    getPossibleMoves() {
        return this.possibleMoves;
    }

    getMoves(board: Board, sliced?: false): number[]
    getMoves(board: Board, sliced: true): number[][]
    getMoves(board: Board, sliced?: boolean) {
        if (sliced) {
            return [];
        }
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

    _getDiagonalMoves = (board: Board, add: number, range = BOARD_SIZE) => {
        const currentColor = this.getColor();
        const currentPos = this.position;

        const isBorderCell = (move: number) => ((move + 1) % BOARD_SIZE === 0 && (add === -7 || add === 9))
          || (move % BOARD_SIZE === 0 && (add === 7 || add === -9));

        if (isBorderCell(currentPos)) {
            return [];
        }

        return getDiagonalMovesRec(currentPos + add, range, []);

        function getDiagonalMovesRec (move: number, range: number, moves: number[]) {
            if (move < 0 || move >= CELL_QTY || range <= 0) {
                return moves;
            }

            const piece = board.getValueFromCell(move);

            if (piece) {
                if (piece.getColor() !== currentColor) {
                    moves.push(move);
                }
                return moves;
            }

            moves.push(move);

            if (isBorderCell(move)) {
                return moves;
            }

            return getDiagonalMovesRec(move + add, range - 1, moves);
        }
    }
}

export class Pawn extends Piece {
    direction: EDirection

    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "pawn";
        this.direction = color === EPlayer.White ? EDirection.Positive : EDirection.Negative;
    }

    getMoves(board: Board, sliced?: false): number[]
    getMoves(board: Board, sliced: true): number[][]
    getMoves(board: Board, sliced?: boolean) {
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

        if (sliced) {
            return [correctDiagonalMoves, correctVerticalMoves];
        }

        this.possibleMoves = correctDiagonalMoves.concat(correctVerticalMoves);

        return this.possibleMoves;
    }
}

export class Rook extends Piece {
    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "rook";
    }

    getMoves(board: Board, sliced?: false): number[]
    getMoves(board: Board, sliced: true): number[][]
    getMoves(board: Board, sliced?: boolean) {
        const v1 = this._getVerticalMoves(board, -1);
        const v2 = this._getVerticalMoves(board, 1);

        const h1 = this._getHorizontalMoves(board, 1);
        const h2 = this._getHorizontalMoves(board,-1);

        if (sliced) {
            return [v1, v2, h1, h2];
        }

        this.possibleMoves = v1.concat(v2).concat(h1).concat(h2);

        return this.possibleMoves;
    }
}

export class Knight extends Piece {
    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "knight";
    }

    // BUG WITH A/B OR G/H columns
    getMoves(board: Board, sliced?: false): number[]
    getMoves(board: Board, sliced: true): number[][]
    getMoves(board: Board, sliced?: boolean) {
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

        if (sliced) {
            return [moves];
        }

        this.possibleMoves = moves;
        return this.possibleMoves;
    }
}

export class Bishop extends Piece {
    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "bishop";
    }

    getMoves(board: Board, sliced?: false): number[]
    getMoves(board: Board, sliced: true): number[][]
    getMoves(board: Board, sliced?: boolean) {
        const a1 = this._getDiagonalMoves(board, -7);
        const a2 = this._getDiagonalMoves(board, -9);
        const a3 = this._getDiagonalMoves(board, 7);
        const a4 = this._getDiagonalMoves(board, 9);

        if (sliced) {
            return [a1, a2, a3, a4];
        }

        this.possibleMoves = a1.concat(a2).concat(a3).concat(a4);
        return this.possibleMoves;
    }
}

export class King extends Piece {
    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "king";
    }

    getCastlingMoves(board: Board) {
        const defaultKingPosition = this.color == EPlayer.White ? 60 : 4;
        const castlingMoves: number[] = [];
        const didKingMove = Boolean(board.moves.find(move => move.includes(defaultKingPosition)));

        const isCastlingValid = (rookPos: number, moves: number[][], direction: number) => {
            const didRookMove = Boolean(moves.find(move => move.includes(rookPos)));

            if (didKingMove || didRookMove) {
                return false;
            }

            return this._getHorizontalMoves(board, direction).includes(rookPos - direction);
        }

        if (isCastlingValid(defaultKingPosition + 3, board.moves, 1)) {
            castlingMoves.push(defaultKingPosition + 2);
        }

        if (isCastlingValid(defaultKingPosition - 4, board.moves, -1)) {
            castlingMoves.push(defaultKingPosition - 2);
        }

        return castlingMoves
    }

    getMoves(board: Board, sliced?: false): number[]
    getMoves(board: Board, sliced: true): number[][]
    getMoves(board: Board, sliced?: boolean) {
        const d1 = this._getDiagonalMoves(board, -7, 1);
        const d2 = this._getDiagonalMoves(board, -9, 1);
        const d3 = this._getDiagonalMoves(board, 7, 1);
        const d4 = this._getDiagonalMoves(board, 9, 1);

        const v1 = this._getVerticalMoves(board, -1, 1);
        const v2 = this._getHorizontalMoves(board, 1, 1);

        const h1 = this._getHorizontalMoves(board, 1, 1);
        const h2 = this._getHorizontalMoves(board,-1, 1);

        const castlingMoves = this.getCastlingMoves(board);

        if (sliced) {
            return [d1, d2, d3, d4, v1, v2, h1, h2, castlingMoves];
        }

        this.possibleMoves = d1.concat(d2).concat(d3).concat(d4).concat(v1).concat(v2).concat(h1).concat(h2).concat(castlingMoves);
        return this.possibleMoves;
    }
}

export class Queen extends Piece {
    constructor(color: EPlayer, position: number) {
        super(color, position);
        this.type = "queen";
    }

    getMoves(board: Board, sliced?: false): number[]
    getMoves(board: Board, sliced: true): number[][]
    getMoves(board: Board, sliced?: boolean) {
        const d1 = this._getDiagonalMoves(board, -7);
        const d2 = this._getDiagonalMoves(board, -9);
        const d3 = this._getDiagonalMoves(board, 7);
        const d4 = this._getDiagonalMoves(board, 9);

        const v1 = this._getVerticalMoves(board, -1);
        const v2 = this._getVerticalMoves(board, 1);

        const h1 = this._getHorizontalMoves(board, 1);
        const h2 = this._getHorizontalMoves(board,-1);

        if (sliced) {
            return [d1, d2, d3, d4, v1, v2, h1, h2];
        }

        this.possibleMoves = d1.concat(d2).concat(d3).concat(d4).concat(h1).concat(h2).concat(v1).concat(v2);
        return this.possibleMoves;
    }
}
