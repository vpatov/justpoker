import React, { useState } from "react";
import { Theme, InitThemeSetter } from "./Theme";
import { ThemeProvider } from "@material-ui/core/styles";
import GameContainer from "./GameContainer";
import Home from "./Home";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App(props) {
  const [theme, setTheme] = useState(Theme);
  InitThemeSetter(setTheme);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Switch>
          <Route path="/game" component={GameContainer} />
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
