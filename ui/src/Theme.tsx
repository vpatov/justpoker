import { createMuiTheme } from "@material-ui/core/styles";

import lightBlue from "@material-ui/core/colors/lightBlue";
import green from "@material-ui/core/colors/green";
import blue from "@material-ui/core/colors/blue";
import red from "@material-ui/core/colors/red";
import grey from "@material-ui/core/colors/grey";
import teal from "@material-ui/core/colors/teal";

declare module "@material-ui/core/styles/createMuiTheme" {
    interface Theme {
        custom?: any; // optional
    }
}

export const CUSTOM_THEME = {
    custom: {
        HEARTS: {
            backgroundColor: red[800],
        },
        DIAMONDS: {
            backgroundColor: lightBlue[800],
        },
        SPADES: {
            backgroundColor: "black",
        },
        CLUBS: {
            backgroundColor: green[600],
        },
        HIDDEN: {
            backgroundColor: `${grey[900]}`,
            backgroundImage: `url("https://www.transparenttextures.com/patterns/black-thread-light.png")`,
            backgroundSize: "30% 20%",
            backgroundPosition: "50% 50%",
        },
        BACKGROUND: {
            background:
                " radial-gradient(circle, rgba(50,112,173,1) 0%, rgba(14,47,83,1) 100%)",
        },
        TABLE: {
            border: `14px solid rgba(255,255,255,0.7)`,
            boxShadow: `0 0 0 4px black, 0 4px 4px 4px black`,
            backgroundColor: "rgba(0,0,0,0.3)",
            // background: `radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%);`,
            // backgroundSize: "100%",
            // backgroundPosition: "50% 50%",
            // backgroundRepeat: "no-repeat",
            // backgroundBlendMode: "screen",
        },
        STACK: {
            borderRadius: 40,
            backgroundColor: "white",
            boxShadow: "0 5px 10px rgba(59, 43, 91, 0.7)",
        },
        CONTROLLER: {
            backgroundColor: "rgba(255,255,255,0.24)",
        },
        BET: {
            border: "1px solid white",
            backgroundColor: teal[200],
        },
        ACTION_BUTTONS: {
            FOLD: {
                color: red[600],
            },
            BET: {
                color: green[600],
            },
            CHECK: {
                color: blue[500],
            },
            CALL: {
                color: blue[800],
            },
        },
    },
    typography: {
        fontFamily: "Roboto, Avenir, Helvetica, Arial, sans-serif",
    },
};

export const Theme = createMuiTheme(CUSTOM_THEME);
