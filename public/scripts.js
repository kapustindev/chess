const BOARD_SIZE = 8;

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

const abstractBoard = [];
for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i += 1) {
    if (i > 47 && i < 56) {
        abstractBoard.push(new Pawn("white", i))
    } else if (i > 7 && i < 16) {
        abstractBoard.push(new Pawn("black", i))
    } else {
        abstractBoard.push(null);
    }
}

initBoard();

function initBoard() {
    const board = document.getElementById("field");
    const rows = document.querySelector(".rows");
    const alpha = document.querySelector(".alphabet");

    let dragged;
    let draggedIdx;

    let isNewRow = false;


    for (let i = BOARD_SIZE; i > 0; i -= 1) {
        const rowNumber = document.createElement("div");
        rowNumber.textContent = String(i);
        rowNumber.classList.add("row-number");
        rows.appendChild(rowNumber);
    }

    for (let i = 0; i < BOARD_SIZE; i += 1) {
        const char = document.createElement("div");
        char.textContent = String.fromCharCode(i + 65);
        char.classList.add("char");
        alpha.appendChild(char);
    }

    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i += 1) {
        const cell = document.createElement("div");
        cell.setAttribute("id", String(i));
        const piece = document.createElement("div");
        const abstractPiece = abstractBoard[i];

        piece.setAttribute("draggable", "true");

        piece.addEventListener("dragstart", (e) => {
            removeSpecialEffects();

            abstractPiece.getMoves(abstractBoard).forEach((move) => {
                const square = document.getElementById(move);
                square.classList.add("possible");
            })

            dragged = e.target;
            draggedIdx = dragged.parentNode.id;
        })

        if (abstractPiece) {
            piece.classList.add("piece", abstractPiece.getType(), abstractPiece.getColor());
            cell.appendChild(piece);
        }

        // if (i === 0 || i === 7) {
        //     piece.classList.add("rook", "black");
        //     cell.appendChild(piece);
        // }
        //
        // if (i === 1 || i === 6) {
        //     piece.classList.add("knight", "black");
        //     cell.appendChild(piece);
        // }
        //
        // if (i === 2 || i === 5) {
        //     piece.classList.add("bishop", "black");
        //     cell.appendChild(piece);
        // }
        //
        // if (i === 3) {
        //     piece.classList.add("queen", "black");
        //     cell.appendChild(piece);
        // }
        //
        // if (i === 4) {
        //     piece.classList.add("king", "black");
        //     cell.appendChild(piece);
        // }
        //
        //
        // if (i === 56 || i === 63) {
        //     piece.classList.add("rook", "white");
        //     cell.appendChild(piece);
        // }
        //
        // if (i === 57 || i === 62) {
        //     piece.classList.add("knight", "white");
        //     cell.appendChild(piece);
        // }
        //
        // if (i === 58 || i === 61) {
        //     piece.classList.add("bishop", "white");
        //     cell.appendChild(piece);
        // }
        //
        // if (i === 59) {
        //     piece.classList.add("queen", "white");
        //     cell.appendChild(piece);
        // }
        //
        // if (i === 60) {
        //     piece.classList.add("king", "white");
        //     cell.appendChild(piece);
        // }
        //

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

            // set new position
            const draggedPiece = abstractBoard[draggedIdx];

            if (draggedPiece.getMoves(abstractBoard).includes(i)) {
                abstractBoard[draggedPiece.getPosition()] = null;
                draggedPiece.setPosition(i);
                abstractBoard[i] = draggedPiece;

                makeMove(dragged, e.currentTarget);

                socket.emit("move", ({ start: draggedIdx, end: i }))
            }
        })


        board.appendChild(cell);
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
    const board = document.getElementById("field");
    const pieces = document.querySelectorAll(".piece");
    const rowsWrapper = document.querySelector(".rows");
    const rows = document.querySelectorAll(".row-number");
    const alpha = document.querySelector(".alphabet");
    const chars = document.querySelectorAll(".char");

    pieces.forEach(piece => piece.classList.add("reversed"));
    board.classList.add("reversed");
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

        const pieceInThePath = verticalMoves.find(move => board[move]);

        const correctVerticalMoves = verticalMoves.slice(pieceInThePath);

        const diagonalMoves = [this.position - (7 * this.direction), this.position - (9 * this.direction)];

        const correctDiagonalMoves = diagonalMoves.filter(move => {
            if (board[move]) {
                return board[move].getColor() !== this.getColor();
            }
            return false;
        })

        return correctDiagonalMoves.concat(correctVerticalMoves);
    }
}
