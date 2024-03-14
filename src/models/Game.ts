import { EPlayer, GameStatus } from "./types";

class Game {
    status: GameStatus;
    player: EPlayer;
    move: number;

    constructor() {
        this.status = "IN_PROGRESS";
        this.player = EPlayer.White
        this.move = 1
    }

    getPlayer() {
        return this.player;
    }
    setPlayer(opponent: EPlayer) {
        this.player = opponent;
    }
    getMove() {
        return this.move;
    }
    incMove() {
        this.move += 1;
    }
    getStatus() {
        return this.status;
    }
    setStatus(newStatus: GameStatus) {
        this.status = newStatus;
    }
    endTurn() {
        this.setPlayer(this.player === EPlayer.White ? EPlayer.Black : EPlayer.White);
    }
}

export default Game;
