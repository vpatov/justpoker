import React, { useState, useEffect } from "react";
import Game from "./Game";
import { CleanGame } from "./shared/models/uiState";
import { WsServer } from "./api/ws";

function GameContainer(): any {
  const [game, setGame] = useState(CleanGame);

  useEffect(() => {
    const succ = WsServer.openWs();
    if (succ) {
      WsServer.subscribe("game", onReceiveNewGame);
    }
  }, []);

  const onReceiveNewGame = (game: any) => {
    setGame(game);
  };

  function render() {
    return <Game game={game} />;
  }

  return render();
}

export default GameContainer;
