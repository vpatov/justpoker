import { Service } from 'typedi';
import { Card, SUIT_ABBREVIATIONS } from '../../../ui/src/shared/models/cards';
import { Hand as HandSolver } from 'pokersolver';

// TODO declare types for this module and make an npm package
export declare interface Hand {
    name: string;
}

@Service()
export class HandSolverService {


    computeBestHandFromCards(cards: Card[]): Hand {
        const strCards = cards.map((card) => `${card.rank}${SUIT_ABBREVIATIONS[card.suit]}`);
        return this.computeBestHandFromStrCards(strCards);
    }

    computeBestHandFromStrCards(cards: string[]): Hand {
        return HandSolver.solve(cards);
    }

    getWinningHands(hands: Hand[]): Hand[] {
        return HandSolver.winners(hands);
    }
}
