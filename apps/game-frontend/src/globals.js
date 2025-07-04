// In globals.js
const gameInfo = {
  initial_game_state: null,
  game_type: null,
  player_id: null,
  socket_id: null,
};

function updateGameInfo(newInfo) {
  Object.assign(gameInfo, newInfo);
}

export { gameInfo, updateGameInfo };
