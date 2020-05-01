import {
    UiGameState,
    Table,
    Controller,
    Player,
} from "../shared/models/uiState";

export const tableSelector = (gs: UiGameState): Table => gs.table;
export const controllerSelector = (gs: UiGameState): Controller =>
    gs.controller;
export const heroIsSeatedSelector = (gs: UiGameState): boolean => gs.global.heroIsSeated;
export const playersSelector = (gs: UiGameState): Player[] => gs.players;
export const heroHandLabelSelector = (gs: UiGameState): string =>
    (gs.players.find((p) => p.hero) || {}).handLabel || "";


export const allowStraddleSelector = (gs: UiGameState): boolean => gs.global.allowStraddle;
