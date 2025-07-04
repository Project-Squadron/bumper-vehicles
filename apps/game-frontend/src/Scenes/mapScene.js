import Button from "../EventObjects/Button.js";
import mouse from "../EventObjects/MouseManager.js";
import sceneManager from "../EventObjects/SceneManager.js";
import socket from "../networking/socket.js";
import { gameInfo, updateGameInfo } from "../globals.js";
import { removeForm } from "../utils/htmlForms.js";

// Scene state
let activePanel = null;
let hasJoined = false;

let waitingRoom = {
  currentPlayers: 0,
  requiredPlayers: 0,
};

function displayRacePanel(p) {
  const panelWidth = 400;
  const panelHeight = 300;
  const x = (p.width - panelWidth) / 2;
  const y = (p.height - panelHeight) / 2;

  // Panel background
  p.fill(100, 100, 100);
  p.noStroke();
  p.rect(x, y, panelWidth, panelHeight);

  // Panel content
  p.fill(255);
  p.textSize(18);
  p.textAlign(p.CENTER, p.TOP);
  p.text("Race Event", p.width / 2, y + 20);

  p.textSize(16);
  p.textAlign(p.LEFT, p.TOP);
  p.text(
    "• Compete against other players in a race to the finish",
    x + 20,
    y + 60
  );
  p.text("• First player to complete the course wins", x + 20, y + 90);
  p.text("• Requires 2-4 players to start", x + 20, y + 120);

  if (hasJoined) {
    p.text(
      `Players: ${waitingRoom.currentPlayers}/${waitingRoom.requiredPlayers}`,
      x + 20,
      y + 200
    );
  }
}

function displayBattlePanel(p) {
  const panelWidth = 400;
  const panelHeight = 300;
  const x = (p.width - panelWidth) / 2;
  const y = (p.height - panelHeight) / 2;

  // Panel background
  p.fill(100, 100, 100);
  p.noStroke();
  p.rect(x, y, panelWidth, panelHeight);

  // Panel content
  p.fill(255);
  p.textSize(24);
  p.textAlign(p.CENTER, p.TOP);
  p.text("Battle Event", p.width / 2, y + 20);

  p.textSize(16);
  p.textAlign(p.LEFT, p.TOP);
  p.text("• Battle against other players in an arena", x + 20, y + 60);
  p.text("• Last player standing wins", x + 20, y + 90);
  p.text("• Requires 2-4 players to start", x + 20, y + 120);

  if (hasJoined) {
    p.text(
      `Players: ${waitingRoom.currentPlayers}/${waitingRoom.requiredPlayers}`,
      x + 20,
      y + 200
    );
  }
}

async function initializeGame(gameType) {
  try {
    // Connect to the socket
    await socket.connect();

    // update game info
    gameInfo.game_type = activePanel;
    gameInfo.socket_id = socket.id;

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      socket.connected = false;
    });

    // Set up error handling
    socket.on("connect-error", (error) => {
      console.error("Connection error:", error);
      reject(error);
    });

    socket.on("player-id", (id) => {
      gameInfo.player_id = id;
    });

    socket.on("waitingRoom", (newWaitingRoom) => {
      waitingRoom = newWaitingRoom;
    });

    socket.on("gameSetup", function gameSetupHandler(initial_game_state) {
      console.log("Receiving Initial Game State: ", initial_game_state);
      gameInfo.initial_game_state = initial_game_state;
      sceneManager.createTransition("game");
      // Remove this event listener after it's been called
      socket.off("gameSetup", gameSetupHandler);
    });

    // Now that our socket is setup,
    // send join message to server
    socket.emit("player:join:event", {
      gameType: gameType,
      userData: sceneManager.user,
    });

    return true;
  } catch (error) {
    console.error("Failed to connect to socket:", error);
    return false;
  }
}
const buttons = {
  race: new Button({
    width: 80,
    height: 80,
    display: function () {
      const p = sceneManager.getCanvas();
      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(200, 200, 200, 200);
      }
      p.rect(this.x, this.y, this.width, this.height);
      p.fill(0);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Race", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      activePanel = "race";
      hasJoined = false;
    },
  }),
  battle: new Button({
    width: 80,
    height: 80,
    display: function () {
      const p = sceneManager.getCanvas();
      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(200, 200, 200, 200);
      }
      p.rect(this.x, this.y, this.width, this.height);
      p.fill(0);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Battle", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      activePanel = "battle";
      hasJoined = false;
    },
  }),
  join: new Button({
    width: 100,
    height: 40,
    display: function () {
      if (!activePanel || hasJoined) return;
      const p = sceneManager.getCanvas();
      const panelWidth = 400;
      const panelHeight = 300;
      const x = (p.width - panelWidth) / 2;
      const y = (p.height - panelHeight) / 2;
      this.x = x + panelWidth / 2 - 110;
      this.y = y + panelHeight - 60;
      p.noStroke();
      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(200, 200, 200, 200);
      }
      p.rect(this.x, this.y, this.width, this.height);
      p.fill(0);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Join", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      if (hasJoined) return;
      hasJoined = true;
      initializeGame(activePanel);
    },
  }),
  // Cancel button (only active when panel is open and joined)
  cancel: new Button({
    width: 100,
    height: 40,
    display: function () {
      if (!activePanel || !hasJoined) return;

      const p = sceneManager.getCanvas();

      p.noStroke();

      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(200, 200, 200, 200);
      }

      p.rect(this.x, this.y, this.width, this.height);

      p.fill(0);
      p.textSize(16);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Cancel", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: function () {
      if (!activePanel || !hasJoined) return;

      if (socket.connected && gameInfo.player_id) {
        hasJoined = false;
        socket.emit("player:delete", gameInfo.player_id);
      } else {
        alert("Error. Try Again.");
      }
    },
  }),
  // Exit button (only active when panel is open)
  exit: new Button({
    width: 30,
    height: 30,
    display: function () {
      if (!activePanel) return;

      const p = sceneManager.getCanvas();

      p.noStroke();

      if (this.isInside(mouse, this)) {
        p.fill(175);
        mouse.setCursor("pointer");
      } else {
        p.fill(200, 200, 200, 200);
      }

      p.rect(this.x, this.y, this.width, this.height);

      // Draw X
      p.stroke(0);
      p.strokeWeight(2);
      p.line(
        this.x + 5,
        this.y + 5,
        this.x + this.width - 5,
        this.y + this.height - 5
      );
      p.line(
        this.x + this.width - 5,
        this.y + 5,
        this.x + 5,
        this.y + this.height - 5
      );
    },
    onClick: function () {
      if (!activePanel) return;

      activePanel = null;
      hasJoined = false;

      if (socket.connected && gameInfo.player_id) {
        socket.emit("player:delete", gameInfo.player_id);
      }
    },
  }),
};

const mapScene = {
  name: "Map Scene",
  init: function () {
    removeForm("login-form");
    removeForm("signup-form");
    removeForm("verify-form");
    updateGameInfo({
      initial_game_state: null,
      game_type: null,
      player_id: null,
      socket_id: null,
    });
    activePanel = null;
    hasJoined = false;
  },
  display: function () {
    const p = sceneManager.getCanvas();
    if (activePanel === "race") {
      displayRacePanel(p);
      buttons["join"].update(200, 300);
    } else if (activePanel === "battle") {
      displayBattlePanel(p);
      buttons["join"].update(200, 300);
    }

    if (activePanel) {
      const panelWidth = 400;
      const panelHeight = 300;
      const x = (p.width - panelWidth) / 2;
      const y = (p.height - panelHeight) / 2;

      buttons["exit"].update(x + panelWidth - 40, y + 10);
    }
    if (activePanel && hasJoined) {
      const panelWidth = 400;
      const panelHeight = 300;
      const x = (p.width - panelWidth) / 2;
      const y = (p.height - panelHeight) / 2;

      buttons["cancel"].update(x + panelWidth / 2 + 10, y + panelHeight - 60);
    }

    // Update button positions
    buttons["race"].update(100, 100);
    buttons["battle"].update(200, 100);
  },
  buttons: Object.values(buttons),
};

export default mapScene;
