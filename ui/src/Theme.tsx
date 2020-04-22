import { createMuiTheme } from "@material-ui/core/styles";

import lightBlue from "@material-ui/core/colors/lightBlue";
import lightGreen from "@material-ui/core/colors/lightGreen";
import green from "@material-ui/core/colors/green";
import blue from "@material-ui/core/colors/blue";
import indigo from "@material-ui/core/colors/indigo";
import red from "@material-ui/core/colors/red";
import grey from "@material-ui/core/colors/grey";
import teal from "@material-ui/core/colors/teal";
import blueGrey from "@material-ui/core/colors/blueGrey";
import orange from "@material-ui/core/colors/orange";

declare module "@material-ui/core/styles/createMuiTheme" {
    interface Theme {
        custom?: any;
    }
}

export const CUSTOM_THEME = {
    custom: {
        HEARTS: {
            backgroundColor: red["A700"],
        },
        DIAMONDS: {
            backgroundColor: indigo[800],
        },
        SPADES: {
            backgroundColor: grey[800],
        },
        CLUBS: {
            backgroundColor: lightGreen[900],
        },
        HIDDEN: {
            color: `${blueGrey[500]}`,
            backgroundColor: `${blueGrey[700]}`,
        },
        FOLDED: {
            opacity: 0.8,
            filter: "grayscale(50%) brightness(0.4)",
        },
        BACKGROUND: {
            background:
                "radial-gradient(circle , rgba(60,60,75,1) 0%, rgba(22,22,40,1) 80%);",
        },
        TABLE: {
            border: `0.7vmin solid rgba(0,0,0,0.4)`,
            boxShadow: ` 0 4px 4px 4px rgba(255,255,255,0.7)`,
            backgroundColor: "black",
            background: `radial-gradient(circle, rgba(30,30,42,1) 0%, rgba(20,20,35,1) 56%, rgba(10,10,10,1) 100%);`,
        },
        STACK: {
            color: "white",
            backgroundColor: " rgba(28,28,42,1)",
            borderRadius: "0.6vmin",
            boxShadow: "0 5px 15px rgba(10,10,10,0.9)",
        },
        CONTROLLER: {
            backgroundColor: "rgba(0,0,0,0.3)",
            background: `linear-gradient(rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);`,
        },
        BET: {
            border: "1px solid white",
            backgroundColor: teal[200],
        },
        CHAT: {
            background: `linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(50, 30, 57, 0.3)80%);`,
        },
        // ACTION_BUTTONS: {
        //     FOLD: {
        //         color: red[600],
        //     },
        //     BET: {
        //         color: green[600],
        //     },
        //     CHECK: {
        //         color: blue[500],
        //     },
        //     CALL: {
        //         color: blue[800],
        //     },
        //     STARTGAME: {
        //         color: lightGreen[800],
        //     },
        // },
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
    overrides: {
        MuiOutlinedInput: {
            notchedOutline: {
                borderColor: `white`,
            },
            input: {
                color: "white",
            },
        },
        MuiButton: {
            root: {
                border: `1px solid white`,
                backgroundColor: "rgba(0,0,0,0.9)",
                color: "white",
                overflow: "hidden",
                "&:hover": {
                    border: `1px solid ${teal["A400"]}`,
                    transition: "",
                    "&:before": {
                        position: "absolute",
                        content: '""',
                        width: "100%",
                        height: "100%",
                        zIndex: -1,
                        backgroundColor: teal["100"],
                        "-webkit-animation": "$scale 0.1s 1 ease-in-out",
                        animation: "$scale 0.1s 1 ease-in-out",
                        opacity: 0.1,
                    },
                },
            },
        },
    },
};

export const Theme = createMuiTheme(CUSTOM_THEME);
