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
}

export declare interface SizingButton {
  value: number;
  label: string;
}

export declare interface ActionButton {
  action: ActionType;
  label: string;
}

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
  label: "Bet",
};

export const ONE_THIRD_BET: SizingButton = {
  label: "1/3",
  value: 0,
};
export const ONE_HALF_BET: SizingButton = {
  label: "1/2",
  value: 0,
};
export const TWO_THIRDS_BET: SizingButton = {
  label: "2/3",
  value: 0,
};
export const POT_SIZE_BET: SizingButton = {
  label: "POT",
  value: 0,
};

export const OVER_POT_BET: SizingButton = {
  label: "OverBet",
  value: 0,
};
export const SHOVE_BET: SizingButton = {
  label: "Shove",
  value: 0,
};

export const TWO_BB_SIZING = {
  label: "2 BB",
  value: 0,
};

export const THREE_BB_SIZING = {
  label: "3 BB",
  value: 0,
};

export const FOUR_BB_SIZING = {
  label: "4 BB",
  value: 0,
};

export const PREFLOP_SIZING_BUTTONS: Array<SizingButton> = [
  TWO_BB_SIZING,
  THREE_BB_SIZING,
  FOUR_BB_SIZING,
];

export const POSTFLOP_SIZING_BUTTONS: Array<SizingButton> = [
  ONE_THIRD_BET,
  ONE_HALF_BET,
  TWO_THIRDS_BET,
  POT_SIZE_BET,
  OVER_POT_BET,
  SHOVE_BET,
];

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

export const cleanController: Controller = {
  toAct: false,
  unsetCheckCall: false,
  min: 0,
  max: 0,
  pot: 0,
  sizingButtons: PREFLOP_SIZING_BUTTONS,
  actionButtons: NOT_FACING_BET_ACTION_BUTTONS,
};
