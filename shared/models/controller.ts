import { ActionType } from "./wsaction";

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

export const cleanController: Controller = {
  toAct: false,
  unsetCheckCall: false,
  min: 25,
  max: 1000,
  pot: 12000,
  sizingButtons: [
    {
      label: "1/2",
      value: 6000,
    },
  ],
  actionButtons: [
    {
      action: ActionType.FOLD,
      label: "Fold",
    },
    {
      action: ActionType.CHECK,
      label: "Check",
    },
    {
      action: ActionType.BET,
      label: "Bet",
    },
  ],
};
