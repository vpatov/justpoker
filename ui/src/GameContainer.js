import React, { useState, useEffect } from "react";
import Game from "./Game";
import TestGame from "./TestGame";
import { OpenWs, Subscribe } from "./api/ws";

function GameContainer(props) {
  const [game, setGame] = useState(TestGame);

  useEffect(() => {
    const succ = OpenWs();
    if (succ) {
      Subscribe("game", onReceiveNewGame);
    }
  }, []);

  const onReceiveNewGame = (game) => {
    setGame(game);
  };

  function render() {
    return <Game game={game} />;
  }

  return render();
}

export default GameContainer;