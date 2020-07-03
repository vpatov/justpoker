import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemePreferences, UserPreferences } from '../shared/models/ui/userPreferences';
import cloneDeep from 'lodash/cloneDeep';
import { CUSTOM_THEME, DEFAULT_PREFERENCES } from '../style/Theme';
import { ThemeProvider } from '@material-ui/core/styles';
import GameContainer from '../game/GameContainer';
import { createMuiTheme } from '@material-ui/core/styles';

import Home from './Home';
import Ledger from '../ledger/Ledger';
import ErrorBoundary from './ErrorBoundry';
import Color from 'color';

const USER_PREFS_LOCAL_STORAGE_KEY = 'jp-user-prefs';

function loadPreferencesIntoTheme(curTheme, prefs: ThemePreferences) {
    const newTheme = cloneDeep(curTheme);
    newTheme.custom.BACKGROUND.backgroundColor = prefs.backgroundColor;
    if (Color(prefs.backgroundColor).isDark()) {
        newTheme.custom.BACKGROUND_CONTRAST_COLOR = 'white';
    } else {
        newTheme.custom.BACKGROUND_CONTRAST_COLOR = 'black';
    }

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
    curPrefs: DEFAULT_PREFERENCES.theme,
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
        <ErrorBoundary>
            <ThemeSetter.Provider value={{ curPrefs: pref, themeSetter: setNewTheme }}>
                <ThemeProvider theme={createMuiTheme(theme)}>
                    <Router>
                        <Switch>
                            <Route exact path="/table/test" render={(props) => <GameContainer useTestGame />} />
                            <Route path="/table/:gameInstanceUUID" component={GameContainer} />
                            <Route path="/ledger/:gameInstanceUUID" component={Ledger} />
                            <Route path="/" component={Home} />
                        </Switch>
                    </Router>
                </ThemeProvider>
            </ThemeSetter.Provider>
        </ErrorBoundary>
    );
}

export default App;
