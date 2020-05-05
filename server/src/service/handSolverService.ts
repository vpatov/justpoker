import { Service } from 'typedi';
import { Card, Hand, SUIT_ABBREVIATIONS, getTwoCardCombinations } from '../../../ui/src/shared/models/cards';
import { Hand as HandSolver } from 'pokersolver';

// TODO declare types for this module and make an npm package

@Service()
export class HandSolverService {
    private computeBestHandFromCards(cards: Card[]): Hand {
        const strCards = cards.map((card) => `${card.rank}${SUIT_ABBREVIATIONS[card.suit]}`);
        return this.computeBestHandFromStrCards(strCards);
    }

    computeBestHandFromStrCards(cards: string[]): Hand {
        return HandSolver.solve(cards);
    }

    getWinningHands(hands: Hand[]): Hand[] {
        return HandSolver.winners(hands);
    }

    computeBestNLEHand(holeCards: Readonly<Card[]>, board: Readonly<Card[]>) {
        return this.computeBestHandFromCards([...holeCards, ...board]);
    }

    computeBestPLOHand(holeCards: Readonly<Card[]>, board: Readonly<Card[]>) {
        const twoCardCombinations = getTwoCardCombinations(holeCards);
        const bestHands = twoCardCombinations.map((twoCards) => this.computeBestHandFromCards([...twoCards, ...board]));
        const winningHands = this.getWinningHands(bestHands);
        return winningHands[0];
    }
}
