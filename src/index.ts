import { BOARD_SIZE, CELL_QTY, ASCII_A } from './constants';
import Game from "./models/Game";
import Board from "./models/Board";

// const socket = io();

// socket.on('registration', ({ name, idx, color }) => {
//     const playerNode = document.getElementById(`player_${idx}`);
//     const [photoNode, nameNode] = playerNode.children;
//
//     photoNode.textContent = name[0].toUpperCase();
//     photoNode.style.backgroundColor = color;
//
//     nameNode.textContent = name;
//     nameNode.classList.add("active");
// });
//
// socket.on('move', ({ start, end }) => {
//     const cells = document.querySelectorAll(".cell");
//
//     const [piece] = cells[start].children;
//     const destination = cells[end];
//
//     makeMove(piece, destination);
// })

startNewGame();

function startNewGame() {
    const game = new Game();
    const board = new Board();

    board.initBoard();

    const gameField = document.getElementById("field")!;
    const rows = document.querySelector<HTMLDivElement>(".rows")!;
    const alpha = document.querySelector<HTMLDivElement>(".alphabet")!;

    let dragged: HTMLDivElement;
    let draggedIdx: string;

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

        if (abstractPiece) {
            piece.classList.add("piece", abstractPiece.getType(), abstractPiece.getColor());

            piece.setAttribute("draggable", "true");
            cell.appendChild(piece);

            piece.addEventListener("dragstart", (e) => {
                removeSpecialEffects();
                dragged = e.target as HTMLDivElement;
                if (dragged.parentNode) {

                    // @ts-expect-error
                    draggedIdx = dragged.parentNode.id;

                    const piece = board.getValueFromCell(+draggedIdx);

                    const isPlayersPiece = piece?.getColor() === game.getPlayer();

                    if (!isPlayersPiece) {
                        e.preventDefault();

                        dragged.classList.add("invalid_move");
                        dragged.parentNode.addEventListener("onmouseleave", () => {
                            dragged.classList.remove("invalid_move");
                        })
                        return;
                    }
                }

                abstractPiece.getMoves(board).forEach((move) => {
                    const square = document.getElementById(String(move))!;
                    square.classList.add("possible");
                })
            })
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

            const draggedPiece = board.getValueFromCell(+draggedIdx);

            if (draggedPiece && draggedPiece.getMoves(board).includes(i)) {
                const startCell = board.convertToAlgebraicNotation(draggedPiece.getPosition());
                const destinationCell = board.convertToAlgebraicNotation(i);
                const hasEnemy = board.getValueFromCell(i);

                board.setValueToCell(draggedPiece.getPosition(), null);
                board.setValueToCell(i, draggedPiece);

                // @ts-expect-error TODO
                makeMove(dragged, e.currentTarget);
                const movesTable = document.querySelector<HTMLDivElement>(".moves")!;
                const move = document.createElement("div");
                move.classList.add("move");
                move.textContent = `${startCell} ${hasEnemy ? "#" : "->"} ${destinationCell}`;

                if (game.getMove() % 2) {
                    const moveLineNumber = document.createElement("div");
                    moveLineNumber.classList.add("move_counter");
                    moveLineNumber.textContent = `${Math.ceil(game.getMove() / 2)}.`;
                    movesTable.appendChild(moveLineNumber);
                }
                game.incMove();

                movesTable.appendChild(move);
                game.endTurn();

                // socket.emit("move", ({ start: draggedIdx, end: i }))
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

function registerPlayer(idx: number) {
    const modal = document.createElement("div");
    modal.classList.add("new_player");

    const input = document.createElement("input");
    const button = document.createElement("button");
    button.innerText = "Register";

    button.addEventListener("click", () => {
        // socket.emit("registration", { name: input.value, idx });
        modal.classList.add("hide");

        if (idx === 2) {
            reverseBoard();
        }
    })

    modal.appendChild(input);
    modal.appendChild(button);
    const body = document.querySelector("body");

    if (body) {
        body.appendChild(modal)
    }
}

function makeMove(piece: HTMLDivElement, destination: HTMLDivElement) {
    if (destination.hasChildNodes()) {
        destination.innerHTML = "";
    }

    destination.appendChild(piece);
}

function reverseBoard() {
    const gameField = document.getElementById("field")!;
    const pieces = document.querySelectorAll<HTMLDivElement>(".piece")!;
    const rowsWrapper = document.querySelector<HTMLDivElement>(".rows")!;
    const rows = document.querySelectorAll<HTMLDivElement>(".row-number");
    const alpha = document.querySelector<HTMLDivElement>(".alphabet")!;
    const chars = document.querySelectorAll<HTMLDivElement>(".char");

    pieces.forEach(piece => piece.classList.add("reversed"));
    gameField.classList.add("reversed");
    rowsWrapper.classList.add("reversed");
    rows.forEach(row => row.classList.add("reversed"));
    alpha.classList.add("reversed");
    chars.forEach(char => char.classList.add("reversed"));
}

function removeSpecialEffects() {
    const allCells = document.querySelectorAll<HTMLDivElement>(".cell");
    allCells.forEach(cell => cell.classList.remove("possible"));
}
