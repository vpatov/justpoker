import {
    UiGameState,
    Table,
    Controller,
    Player,
} from "../shared/models/uiState";

export const tableSelector = (gs: UiGameState): Table => gs.table;
export const controllerSelector = (gs: UiGameState): Controller =>
    gs.controller;
export const heroInGameSelector = (gs: UiGameState): boolean => gs.heroInGame;
export const playersSelector = (gs: UiGameState): Player[] => gs.players;

export const heroHandLabelSelector = (gs: UiGameState): string =>
    (gs.players.find((p) => p.hero) || {}).handLabel || "";
