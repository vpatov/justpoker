import React, { useState } from "react";
import { Theme } from "./Theme";
import { ThemeProvider } from "@material-ui/core/styles";
import GameContainer from "./GameContainer";
import Game from "./Game";
import { TestGame } from "./TestGame";

import Home from "./Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <ThemeProvider theme={Theme}>
      <Router>
        <Switch>
          <Route
            exact
            path="/game/test"
            render={(props) => <Game {...props} game={TestGame} />}
          />
          <Route path="/game" component={GameContainer} />
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
