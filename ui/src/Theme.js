import { createMuiTheme } from "@material-ui/core/styles";

import lightGreen from "@material-ui/core/colors/lightGreen";
import lightBlue from "@material-ui/core/colors/lightBlue";
import green from "@material-ui/core/colors/green";
import blue from "@material-ui/core/colors/blue";
import red from "@material-ui/core/colors/red";
import grey from "@material-ui/core/colors/grey";
import teal from "@material-ui/core/colors/teal";
import cyan from "@material-ui/core/colors/cyan";

import TableTopImage from "./imgs/tableTop.png";
import CardBackImage from "./imgs/cardBack2.png";

const NormalThemeObject = {
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
  typography: {
    fontFamily: "Roboto, Avenir, Helvetica, Arial, sans-serif",
  },
};

const NEON_BLUE = "rgba(0,255,255,1)";
const NEON_PINK = "rgba(246,110,255,1)";
const NEON_GREEN = "rgba(0,254,10,1)";
const NEON_RED = "rgba(255,0,0,1)";

const DarkThemeObject = {
  HEARTS: {
    color: NEON_RED,
    backgroundColor: "black",
  },
  DIAMONDS: {
    color: NEON_BLUE,
    backgroundColor: "black",
  },
  SPADES: {
    color: "white",
    backgroundColor: "black",
  },
  CLUBS: {
    color: NEON_GREEN,
    backgroundColor: "black",
  },
  HIDDEN: {
    backgroundColor: "black",
  },

  BACKGROUND: {
    background: "black",
  },
  TABLE: {
    boxShadow: `2px 3px 9px ${NEON_BLUE}`,
    border: `3px solid ${NEON_BLUE}`,
  },
  STACK: {
    backgroundColor: NEON_GREEN,
    boxShadow: `0 4px 9px ${NEON_GREEN}`,
    border: `3px solid ${NEON_GREEN}`,
    borderRadius: 40,
  },
  CONTROLLER: {
    backgroundColor: NEON_BLUE,
  },
  BET: {
    boxShadow: `0 0px 15px ${NEON_PINK}`,
    backgroundColor: NEON_PINK,
    color: "white",
  },
  typography: {
    fontFamily: "Futura, Avenir, Helvetica, Arial, sans-serif",
  },
};

const NormalTheme = createMuiTheme(NormalThemeObject);
const DarkTheme = createMuiTheme(DarkThemeObject);

export let Theme = NormalTheme;
let ThemeSetter = false;

export const InitThemeSetter = (themeSetter) => {
  ThemeSetter = themeSetter;
};

export const SetTheme = (themeType) => {
  if (ThemeSetter) {
    switch (themeType) {
      case "normal":
        ThemeSetter(NormalTheme);
        break;
      case "dark":
        ThemeSetter(DarkTheme);
        break;
      default:
        ThemeSetter(NormalTheme);
    }
  }
};
