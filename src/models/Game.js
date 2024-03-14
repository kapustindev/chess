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

export default Game;
