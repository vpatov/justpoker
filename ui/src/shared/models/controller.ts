import { ActionType } from "./wsaction";
import { CHECK_ACTION } from "./game";

export declare interface Controller {
  toAct: boolean;
  unsetCheckCall: boolean;
  min: number;
  max: number;
  pot: number;
  sizingButtons: Array<SizingButton>;
  actionButtons: Array<ActionButton>;
  adminButtons: Array<ActionButton>;
}

export declare interface SizingButton {
  value: number;
  label: string;
}

export declare interface ActionButton {
  action: ActionType;
  label: string;
}

/* Action Buttons */
export const FOLD_BUTTON: ActionButton = {
  action: ActionType.FOLD,
  label: "Fold",
};

export const CHECK_BUTTON: ActionButton = {
  action: ActionType.CHECK,
  label: "Check",
};

export const CALL_BUTTON: ActionButton = {
  action: ActionType.CALL,
  label: "Call",
};

export const BET_BUTTON: ActionButton = {
  action: ActionType.BET,
  label: "Bet",
};

export const RAISE_BUTTON: ActionButton = {
  action: ActionType.BET,
  label: "Raise",
};

export const NOT_FACING_BET_ACTION_BUTTONS = [
  FOLD_BUTTON,
  CHECK_BUTTON,
  BET_BUTTON,
];

export const FACING_BET_ACTION_BUTTONS = [
  FOLD_BUTTON,
  CALL_BUTTON,
  RAISE_BUTTON,
];

export const ALL_ACTION_BUTTONS = [
  FOLD_BUTTON,
  CHECK_BUTTON,
  CALL_BUTTON,
  BET_BUTTON,
  // RAISE_BUTTON,
];

/* Common bet sizes */
export const COMMON_BB_SIZINGS: Array<number> = [2, 3, 4, 5];

export const COMMON_POT_SIZINGS: Array<[number, number]> = [
  [1, 3],
  [1, 2],
  [2, 3],
  [1, 1],
  [5, 4],
];

/* Clean Controller for init. */
export const cleanController: Controller = {
  toAct: false,
  unsetCheckCall: false,
  min: 0,
  max: 0,
  pot: 0,
  sizingButtons: [],
  actionButtons: [],
  adminButtons: [],
};
