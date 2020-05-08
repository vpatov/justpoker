import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Theme } from './Theme';
import { ThemeProvider } from '@material-ui/core/styles';
import GameContainer from './GameContainer';

import Home from './Home';

function App() {
    return (
        <ThemeProvider theme={Theme}>
            <Router>
                <Switch>
                    <Route exact path="/game/test" render={(props) => <GameContainer useTestGame />} />
                    <Route path="/game" component={GameContainer} />
                    <Route path="/" component={Home} />
                </Switch>
            </Router>
        </ThemeProvider>
    );
}

export default App;
