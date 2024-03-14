import { EPlayer, GameStatus } from "./types";

class Game {
    status: GameStatus
    player: EPlayer

    constructor() {
        this.status = "IN_PROGRESS";
        this.player = EPlayer.White
    }

    getPlayer() {
        return this.player;
    }
    setPlayer(opponent: EPlayer) {
        this.player = opponent;
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
