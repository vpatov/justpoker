import { UiGameState, Table, Controller, Player, Global, PlayerTimer } from '../shared/models/uiState';

export const tableSelector = (gs: UiGameState): Table => gs.table;
export const controllerSelector = (gs: UiGameState): Controller => gs.controller;
export const heroIsSeatedSelector = (gs: UiGameState): boolean => gs.global.heroIsSeated;
export const playersSelector = (gs: UiGameState): Player[] => gs.players;
export const heroHandLabelSelector = (gs: UiGameState): string =>
    (gs.players.find((p) => p.hero) || {}).handLabel || '';

export const allowStraddleSelector = (gs: UiGameState): boolean => gs.global.allowStraddle;
export const canStartGameSelector = (gs: UiGameState): boolean => gs.global.canStartGame;
export const globalGameStateSelector = (gs: UiGameState): Global => gs.global;
export const heroPlayerTimerSelector = (gs: UiGameState): PlayerTimer =>
    (gs.players.find((p) => p.hero) || {}).playerTimer || { timeElapsed: 0, timeLimit: 0 };
export const heroPlayerToAct = (gs: UiGameState): boolean => (gs.players.find((p) => p.hero) || {}).toAct || false;
