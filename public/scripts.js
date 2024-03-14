const BOARD_SIZE = 8;
const CELL_QTY = BOARD_SIZE * BOARD_SIZE;

const ASCII_A = 65;

const socket = io();

socket.on('registration', ({ name, idx, color }) => {
    const playerNode = document.getElementById(`player_${idx}`);
    const [photoNode, nameNode] = playerNode.children;

    photoNode.textContent = name[0].toUpperCase();
    photoNode.style.backgroundColor = color;

    nameNode.textContent = name;
    nameNode.classList.add("active");
});

socket.on('move', ({ start, end }) => {
    const cells = document.querySelectorAll(".cell");

    const [piece] = cells[start].children;
    const destination = cells[end];

    makeMove(piece, destination);
})

startNewGame();

function startNewGame() {
    const game = new Game();
    const board = new Board();

    board.initBoard();

    const gameField = document.getElementById("field");
    const rows = document.querySelector(".rows");
    const alpha = document.querySelector(".alphabet");

    let dragged;
    let draggedIdx;
    let moveCounter = 1;

    let isNewRow = false;

    for (let i = BOARD_SIZE; i > 0; i -= 1) {
        const rowNumber = document.createElement("div");
        rowNumber.textContent = String(i);
        rowNumber.classList.add("row-number");
        rows.appendChild(rowNumber);
    }

    for (let i = 0; i < BOARD_SIZE; i += 1) {
        const char = document.createElement("div");
        char.textContent = String.fromCharCode(i + ASCII_A);
        char.classList.add("char");
        alpha.appendChild(char);
    }

    for (let i = 0; i < CELL_QTY; i += 1) {
        const cell = document.createElement("div");
        cell.setAttribute("id", String(i));
        const piece = document.createElement("div");
        const abstractPiece = board.getValueFromCell(i);

        piece.setAttribute("draggable", "true");

        piece.addEventListener("dragstart", (e) => {
            removeSpecialEffects();
            dragged = e.target;
            draggedIdx = dragged.parentNode.id;

            const isPlayersPiece = board.getValueFromCell(draggedIdx).getColor() === game.getPlayer();

            if (!isPlayersPiece) {
                alert("It's not your turn!");
                return;
            }

            abstractPiece.getMoves(board).forEach((move) => {
                const square = document.getElementById(move);
                square.classList.add("possible");
            })
        })

        if (abstractPiece) {
            piece.classList.add("piece", abstractPiece.getType(), abstractPiece.getColor());
            cell.appendChild(piece);
        }

        if (i % 8 === 0) {
            isNewRow = !isNewRow;
        }

        cell.classList.add("cell", (isNewRow ? i + 1 : i) % 2 === 0 ? "odd" : "even");

        cell.addEventListener(
            "dragover",
            (event) => {
                // prevent default to allow drop
                event.preventDefault();
            },
            false,
        );

        cell.addEventListener("dragenter", () => {
            if (cell.getAttribute("id") !== draggedIdx) {
                cell.classList.add("target");
            }
        })

        cell.addEventListener("dragleave", () => {
            cell.classList.remove("target");
        })

        cell.addEventListener("drop", (e) => {
            e.preventDefault();

            cell.classList.remove("target");
            removeSpecialEffects();

            const draggedPiece = board.getValueFromCell(draggedIdx);

            if (draggedPiece.getMoves(board).includes(i)) {
                const startCell = board.convertToAlgebraicNotation(draggedPiece.getPosition());
                const destinationCell = board.convertToAlgebraicNotation(i);
                const hasEnemy = board.getValueFromCell(i);

                board.setValueToCell(draggedPiece.getPosition(), null);
                board.setValueToCell(i, draggedPiece);

                makeMove(dragged, e.currentTarget);
                const movesTable = document.querySelector(".moves");
                const move = document.createElement("div");
                move.classList.add("move");
                move.textContent = `${startCell} ${hasEnemy ? "#" : "->"} ${destinationCell}`;

                if (moveCounter % 2) {
                    const moveLineNumber = document.createElement("div");
                    moveLineNumber.classList.add("move_counter");
                    moveLineNumber.textContent = `${Math.ceil(moveCounter / 2)}.`;
                    movesTable.appendChild(moveLineNumber);
                }
                moveCounter += 1;

                movesTable.appendChild(move);
                game.endTurn();

                socket.emit("move", ({ start: draggedIdx, end: i }))
            }
        })

        gameField.appendChild(cell);
    }

    const playerNames = document.querySelectorAll(".player_name");

    for (let idx = 0; idx < playerNames.length; idx += 1) {
        const node = playerNames[idx];
        const takePlaceButton = document.createElement("button");
        takePlaceButton.classList.add("play_button")
        takePlaceButton.innerText = "Play as " + (idx === 0 ? "white" : "black");
        takePlaceButton.addEventListener('click', () => registerPlayer(idx + 1))
        node.append(takePlaceButton)
    }
}

function registerPlayer(idx) {
    const modal = document.createElement("div");
    modal.classList.add("new_player");

    const input = document.createElement("input");
    const button = document.createElement("button");
    button.innerText = "Register";

    button.addEventListener("click", () => {
        socket.emit("registration", { name: input.value, idx });
        modal.classList.add("hide");

        if (idx === 2) {
            reverseBoard();
        }
    })

    modal.appendChild(input);
    modal.appendChild(button);
    const body = document.querySelector("body");

    body.appendChild(modal)
}

function makeMove(piece, destination) {
    if (destination.hasChildNodes()) {
        destination.innerHTML = null;
    }

    destination.appendChild(piece);
}

function reverseBoard() {
    const gameField = document.getElementById("field");
    const pieces = document.querySelectorAll(".piece");
    const rowsWrapper = document.querySelector(".rows");
    const rows = document.querySelectorAll(".row-number");
    const alpha = document.querySelector(".alphabet");
    const chars = document.querySelectorAll(".char");

    pieces.forEach(piece => piece.classList.add("reversed"));
    gameField.classList.add("reversed");
    rowsWrapper.classList.add("reversed");
    rows.forEach(row => row.classList.add("reversed"));
    alpha.classList.add("reversed");
    chars.forEach(char => char.classList.add("reversed"));
}

function removeSpecialEffects() {
    const allCells = document.querySelectorAll(".cell");
    allCells.forEach(cell => cell.classList.remove("possible"));
}

// Class definitions
function Piece(color, position) {
    this.color = color;
    this.position = position;
    this.type = "piece";

    this.getColor = function () {
        return this.color;
    }

    this.getPosition = function () {
        return this.position;
    }

    this.setPosition = function (pos) {
        this.position = pos;
    }

    this.getType = function () {
        return this.type;
    }

    this.isHomeRank = function() {
        return (this.color === "white" && this.position > 47 && this.position < 56)
            || (this.color === "black" && this.position > 7 && this.position < 16);
    }

    this._getHorizontalMoves = (board, direction, range = BOARD_SIZE) => {
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

    this._getVerticalMoves = (board, direction, range = BOARD_SIZE) => {
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

    this._getDiagonalMoves = function(board, range = BOARD_SIZE) {
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

function Pawn(color, position) {
    Piece.call(this, color, position);
    this.type = "pawn";
    this.direction = color === "white" ? 1 : -1;

    this.getMoves = function (board) {
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

function Rook(color, position) {
    Piece.call(this, color, position);
    this.type = "rook";

    this.getMoves = function(board) {
        return this._getVerticalMoves(board, -1)
            .concat(this._getVerticalMoves(board, 1))
            .concat(this._getHorizontalMoves(board, 1))
            .concat(this._getHorizontalMoves(board,-1));
    }
}

function Knight(color, position) {
    Piece.call(this, color, position);
    this.type = "knight";

    // BUG WITH A/B OR G/H columns
    this.getMoves = function (board) {
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

function Bishop(color, position) {
    Piece.call(this, color, position);
    this.type = "bishop";

    this.getMoves = function(board) {
        return this._getDiagonalMoves(board);
    }
}

function King(color, position) {
    Piece.call(this, color, position);
    this.type = "king";

    this.getMoves = function(board) {
        return this._getDiagonalMoves(board, 1)
            .concat(this._getVerticalMoves(board, -1, 1))
            .concat(this._getVerticalMoves(board, 1, 1))
            .concat(this._getHorizontalMoves(board, 1, 1))
            .concat(this._getHorizontalMoves(board,-1, 1));
    }
}

function Queen(color, position) {
    Piece.call(this, color, position);
    this.type = "queen";

    this.getMoves = function(board) {
        return this._getDiagonalMoves(board)
            .concat(this._getVerticalMoves(board, -1))
            .concat(this._getVerticalMoves(board, 1))
            .concat(this._getHorizontalMoves(board, 1))
            .concat(this._getHorizontalMoves(board,-1));
    }
}

function Game() {
    this.status = "IN_PROGRESS";
    this.player = "white"

    this.getPlayer = function() {
        return this.player;
    }
    this.setPlayer = function(opponent) {
        this.player = opponent;
    }
    this.getStatus = function() {
        return this.status;
    }
    this.setStatus = function(newStatus) {
        this.status = newStatus;
    }
    this.endTurn = function() {
        this.setPlayer(this.getPlayer() === "white" ? "black" : "white");
    }
}

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
