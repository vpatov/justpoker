import { Service } from "typedi";
import { Card } from "../models/cards";
import { Player } from "../models/player";
import { GameState } from "../models/gameState";
import { GameStateManager } from "./gameStateManager";

@Service()
export class StateTransformService {
  constructor(private readonly gameStateManager: GameStateManager) {}

  transformGameStateToUIState(clientUUID: string, secureGameState: GameState) {
    // need to define translation
    // need to define interfaces for UIState

    const heroPlayer = this.gameStateManager.getPlayerByClientUUID(clientUUID);
    const board = this.gameStateManager.getBoard();

    const UIState = {
      game: {
        missionControl: {
          heroStack: heroPlayer.chips,
          pot: 0,
        },
        table: {
          spots: 9,
          pot: 0,
          communityCards: board.map((card) => this.transformCard(card)),
          players: Object.entries(
            secureGameState.players
          ).map(([uuid, player]) => this.transformPlayer(player, uuid)),
        },
      },
    };

    return UIState;
  }

  // TODO (players might want to show their hand)
  // TODO should table be in state?
  stripSensitiveFields(clientUUID: string): GameState {
    const connectedClient = this.gameStateManager.getConnectedClient(
      clientUUID
    );
    const clientPlayerUUID = connectedClient.playerUUID;

    connectedClient.uuid = "a";

    const players = Object.fromEntries(
      Object.entries(
        this.gameStateManager.getPlayers()
      ).map(([uuid, player]) => [
        uuid,
        uuid === clientPlayerUUID ? player : { ...player, holeCards: [] },
      ])
    );

    const strippedGameState = {
      ...this.gameStateManager.getGameState(),
      players,
      clientPlayerUUID,
    };

    delete strippedGameState.deck;
    delete strippedGameState.table;

    return strippedGameState;
  }

  transformCard(card: Card) {
    return {
      suit: card.suit,
      number: card.rank,
    };
  }

  transformPlayer(player: Player, heroPlayerUUID: string) {
    return {
      stack: player.chips,
      hand: {
        cards: player.holeCards.map((card) => this.transformCard(card)),
        hidden: heroPlayerUUID !== player.uuid,
      },
      name: player.name,
      toAct: this.gameStateManager.getCurrentPlayerToAct() === heroPlayerUUID,
      hero: player.uuid === heroPlayerUUID,
      position: player.seatNumber,
      bet: 0,
      button: this.gameStateManager.getDealerUUID() === heroPlayerUUID,
    };
  }

  getUIState(clientUUID: string) {
    const strippedState = this.stripSensitiveFields(clientUUID);
    const uiState = this.transformGameStateToUIState(clientUUID, strippedState);
    return uiState;
  }
}
