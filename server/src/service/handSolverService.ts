import { Service } from 'typedi';
import { Card, SUIT_ABBREVIATIONS } from '../../../shared/models/cards';
import { Hand as HandSolver } from 'pokersolver';

@Service()
export class HandSolverService {
    computeBestHandFromCards(cards: Card[]) {
        const strCards = cards.map((card) => `${card.rank}${SUIT_ABBREVIATIONS[card.suit]}`);
        return this.computeBestHandFromStrCards(strCards);
    }

    computeBestHandFromStrCards(cards: string[]) {
        return HandSolver.solve(cards);
    }

    getWinningHands(hands: any[]) {
        return HandSolver.winners(hands);
    }
}
