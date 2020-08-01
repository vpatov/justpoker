import { UiGameState, Table, Controller, UiPlayer, Global, PlayerTimer, MenuButton } from '../shared/models/ui/uiState';
import { GameParameters } from '../shared/models/game/game';
import { PlayerUUID } from '../shared/models/system/uuid';

export const tableSelector = (gs: UiGameState): Table => gs.table;
export const controllerSelector = (gs: UiGameState): Controller => gs.controller;
export const playersSelector = (gs: UiGameState): UiPlayer[] => gs.players;
export const heroHandLabelSelector = (gs: UiGameState): string =>
    (gs.players.find((p) => p.hero) || {}).handLabel || '';

export const canStartGameSelector = (gs: UiGameState): boolean => gs.global.canStartGame;
export const globalGameStateSelector = (gs: UiGameState): Global => gs.global;
export const heroPlayerTimerSelector = (gs: UiGameState): PlayerTimer =>
    (gs.players.find((p) => p.hero) || {}).playerTimer || { timeElapsed: 0, timeLimit: 0 };
export const heroPlayerUUIDSelector = (gs: UiGameState): PlayerUUID =>
    (gs.players.find((p) => p.hero)?.uuid || '') as PlayerUUID;
export const playerListSelector = (gs: UiGameState): UiPlayer[] => gs.players;
export const heroPlayerToAct = (gs: UiGameState): boolean => (gs.players.find((p) => p.hero) || {}).toAct || false;
export const isHeroAdminSelector = (gs: UiGameState): boolean => gs.global.heroIsAdmin;
export const selectMenuButtons = (gs: UiGameState): MenuButton[] => gs.menu;
export const selectGameParameters = (gs: UiGameState): GameParameters => gs.gameParameters;
export const heroPlayerSelector = (gs: UiGameState): UiPlayer | undefined => gs.players.find((p) => p.hero);
export const selectCanShowHideCards = (gs: UiGameState): boolean => gs.global.canShowHideCards;
export const selectUseCents = (gs: UiGameState): boolean => gs.gameParameters.useCents;
