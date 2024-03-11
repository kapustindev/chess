initBoard();

const socket = io();

socket.on('registration', ({ name, idx, color }) => {
    const playerNode = document.getElementById(`player_${idx}`);
    const [photoNode, nameNode] = playerNode.children;

    photoNode.textContent = name[0].toUpperCase();
    photoNode.style.backgroundColor = color;

    nameNode.textContent = name;
    nameNode.classList.add("active");
});

const playerNames = document.querySelectorAll(".player_name");

for (let idx = 0; idx < playerNames.length; idx += 1) {
    const node = playerNames[idx];
    const takePlaceButton = document.createElement("button");
    takePlaceButton.innerText = "Take this place";
    takePlaceButton.addEventListener('click', () => registerPlayer(idx + 1))
    node.append(takePlaceButton)
}

function initBoard() {
    const board = document.getElementById("board");

    let isNewRow = false;

    for (let i = 0; i < 64; i += 1) {
        if (i % 8 === 0) {
            isNewRow = !isNewRow;
        }
        const cell = document.createElement("div");
        cell.classList.add("cell", (isNewRow ? i + 1 : i) % 2 === 0 ? "even" : "odd");

        board.appendChild(cell);
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
    })

    modal.appendChild(input);
    modal.appendChild(button);
    const body = document.querySelector("body");

    body.appendChild(modal)
}
