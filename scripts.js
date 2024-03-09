const board = document.getElementById("board");
console.log({board})
let isNewRow = false;

for (let i = 0; i < 64; i += 1) {
    if (i % 8 === 0) {
        isNewRow = !isNewRow;
    }
    const cell = document.createElement("div");
    cell.classList.add("cell", (isNewRow ? i + 1 : i) % 2 === 0 ? "even" : "odd");

    board.appendChild(cell);
}