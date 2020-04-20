import { createMuiTheme } from "@material-ui/core/styles";

import lightBlue from "@material-ui/core/colors/lightBlue";
import lightGreen from "@material-ui/core/colors/lightGreen";
import green from "@material-ui/core/colors/green";
import blue from "@material-ui/core/colors/blue";
import red from "@material-ui/core/colors/red";
import grey from "@material-ui/core/colors/grey";
import teal from "@material-ui/core/colors/teal";
import orange from "@material-ui/core/colors/orange";

declare module "@material-ui/core/styles/createMuiTheme" {
    interface Theme {
        custom?: any;
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
            backgroundImage: `url("https://www.transparenttextures.com/patterns/climpek.png")`,
            backgroundSize: "80% 80%",
            backgroundPosition: "50% 50%",
        },
        FOLDED: {
            opacity: 0.65,
            filter: "grayscale(50%) brightness(0.5)",
        },
        BACKGROUND: {
            background:
                "linear-gradient(rgba(65,112,173,1) 0%, rgba(34,67,103,1) 100%)",
        },
        TABLE: {
            border: `0.7vmin solid rgba(255,255,255,0.4)`,
            boxShadow: `0 0 0 4px black, 0 4px 4px 4px black`,
            backgroundColor: "rgba(0,0,0,0.1)",
            // background: `radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%);`,
            // backgroundSize: "100%",
            // backgroundPosition: "50% 50%",
            // backgroundRepeat: "no-repeat",
            // backgroundBlendMode: "screen",
        },
        STACK: {
            backgroundColor: "white",
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
            STARTGAME: {
                color: lightGreen[800],
            },
        },
    },
    typography: {
        fontFamily: "Roboto, Avenir, Helvetica, Arial, sans-serif",
    },
    palette: {
        primary: {
            main: teal["A400"],
            light: teal["100"],
        },
        secondary: {
            main: orange["A400"],
            light: orange["100"],
        },
    },
};

export const Theme = createMuiTheme(CUSTOM_THEME);
