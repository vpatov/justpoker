import { createMuiTheme } from "@material-ui/core/styles";

import { PaletteType } from "@material-ui/core";
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

const CUSTOM_PALETTE = {
    primary: {
        main: teal["A400"],
        light: teal["100"],
    },
    secondary: {
        main: orange["A400"],
        light: orange["100"],
    },
};

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
                "linear-gradient(360deg, rgba(50,50,55) 0%, rgb(22,22,30));",
        },
        TABLE: {
            border: `0.7vmin solid rgba(0,0,0,0.4)`,
            boxShadow: ` 0 3px 3px 3px rgba(255,255,255,0.4)`,
            backgroundColor: "black",
            background: `radial-gradient(circle, rgba(30,30,42,1) 0%, rgba(20,20,35,1) 56%, rgba(10,10,10,1) 100%);`,
        },
        STACK: {
            color: "white",
            backgroundColor: " rgba(22,22,36,1)",
            borderRadius: "0.6vmin",
            boxShadow: "0 5px 15px rgba(10,10,10,0.9)",
        },
        CONTROLLER: {
            backgroundColor: "rgba(0,0,0,0.3)",
            background: `linear-gradient(rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%);`,
            boxSizing: "border-box",
            transition: "box-shadow 0.4s ease-in-out;",
        },
        CONTROLLER_TO_ACT: {
            boxShadow: `0 0px 26px ${CUSTOM_PALETTE.primary.main}`,
        },
        BET: {
            border: "1px solid white",
            backgroundColor: teal[200],
        },
        CHAT: {
            zIndex: 10,
            backgroundColor: "rgba(40, 40, 40, 0.3)",
            boxShadow: ` 0 3px 3px 3px rgba(0,0,0,0.2)`,
        },
        ACTION_BUTTONS: {
            FOLD: {
                borderColor: red["A200"],
                color: red["A200"],
            },
            FOLD_QUEUED: {
                backgroundColor: red["A200"] + " !important",
                color: "black",
            },
            BET: {
                borderColor: green["A400"],
                color: green["A400"],
            },
            BET_QUEUED: {
                backgroundColor: green["A200"] + " !important",
                color: "black",
            },
            CHECK: {
                borderColor: blue["A200"],
                color: blue["A200"],
            },
            CHECK_QUEUED: {
                backgroundColor: blue["A200"] + " !important",
                color: "black",
            },
            CALL: {
                borderColor: blue["A200"],
                color: blue["A200"],
            },
            CALL_QUEUED: {
                backgroundColor: blue["A200"] + " !important",
                color: "black",
            },
            STARTGAME: {
                borderColor: lightGreen["A400"],
                color: lightGreen["A400"],
            },
        },
    },
    typography: {
        fontFamily:
            "Futura, Avenir, AkzidenzGrotesk, Questrial, Helvetica, sans-serif",
    },
    palette: {
        type: "dark" as PaletteType,
        ...CUSTOM_PALETTE,
    },
    overrides: {
        MuiTypography: {
            root: {
                color: "white",
            },
        },
        MuiOutlinedInput: {
            root: {
                "&:hover:not($disabled):not($focused):not($error) $notchedOutline": {
                    borderColor: teal["A200"],
                },
            },
        },
        MuiButton: {
            root: {
                "&:hover": {
                    "&:after": {
                        content: "''",
                        backgroundColor: "rgba(255,255,255,0.15)",
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                    },
                },
            },

            outlined: {
                // padding: "0.4vmin 0.8vmin",
            },
        },
    },
};

export const Theme = createMuiTheme(CUSTOM_THEME);
