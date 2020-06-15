import { getCleanGame, UiGameState, TestGame } from '../shared/models/ui/uiState';

const rootReducer = (state = getCleanGame(), action): UiGameState => {
    switch (action.type) {
        case 'SET_TEST_GAME':
            return TestGame;
        case 'SET_GAME_STATE':
            return action.game;
        default:
            return state;
    }
};

export default rootReducer;
