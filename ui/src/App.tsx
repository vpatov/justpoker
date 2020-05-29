import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemePreferences, UserPreferences } from './shared/models/userPreferences';
import cloneDeep from 'lodash/cloneDeep';
import { CUSTOM_THEME, DEFAULT_PREFERENCES } from './style/Theme';
import { ThemeProvider } from '@material-ui/core/styles';
import GameContainer from './GameContainer';
import { createMuiTheme } from '@material-ui/core/styles';

import Home from './Home';
import Ledger from './Ledger';

const USER_PREFS_LOCAL_STORAGE_KEY = 'JP_userPrefs';

function loadPreferencesIntoTheme(curTheme, prefs: ThemePreferences) {
    const newTheme = cloneDeep(curTheme);
    newTheme.custom.BACKGROUND.background = prefs.background;

    if (prefs.twoColor) {
        newTheme.custom.DIAMONDS = newTheme.custom.HEARTS as any;
        newTheme.custom.CLUBS = newTheme.custom.SPADES as any;
    } else {
        newTheme.custom.DIAMONDS = CUSTOM_THEME.custom.DIAMONDS as any;
        newTheme.custom.CLUBS = CUSTOM_THEME.custom.CLUBS as any;
    }
    return newTheme;
}

export const ThemeSetter = React.createContext({
    curfPrefs: DEFAULT_PREFERENCES.theme,
    themeSetter: (tp: ThemePreferences) => null,
});

function loadInitUserPreferences(): UserPreferences {
    const cachedPrefs = localStorage.getItem(USER_PREFS_LOCAL_STORAGE_KEY);
    if (cachedPrefs) return JSON.parse(cachedPrefs);
    return DEFAULT_PREFERENCES;
}

const initPrefs = loadInitUserPreferences();
const initTheme = loadPreferencesIntoTheme(CUSTOM_THEME, initPrefs.theme);

function App() {
    const [theme, setTheme] = useState(initTheme);
    const [pref, setPrefs] = useState(initPrefs.theme);

    function setNewTheme(tp: ThemePreferences) {
        setPrefs(tp);
        localStorage.setItem(USER_PREFS_LOCAL_STORAGE_KEY, JSON.stringify({ theme: tp }));
        setTheme((oldTheme) => loadPreferencesIntoTheme(oldTheme, tp));
        return null;
    }

    return (
        <ThemeSetter.Provider value={{ curfPrefs: pref, themeSetter: setNewTheme }}>
            <ThemeProvider theme={createMuiTheme(theme)}>
                <Router>
                    <Switch>
                        <Route exact path="/game/test" render={(props) => <GameContainer useTestGame />} />
                        <Route path="/game" component={GameContainer} />
                        <Route path="/ledger" component={Ledger} />
                        <Route path="/" component={Home} />
                    </Switch>
                </Router>
            </ThemeProvider>
        </ThemeSetter.Provider>
    );
}

export default App;
