import { CleanGame, UiGameState } from "../shared/models/uiState";

const rootReducer = (state = CleanGame, action): UiGameState => {
    switch (action.type) {
        case "SET_GAME_STATE":
            return action.game;
        default:
            return state;
    }
};

export default rootReducer;
