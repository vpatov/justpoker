import { Service } from 'typedi';
import { Card, Hand, SUIT_ABBREVIATIONS, getTwoCardCombinations } from '../../../ui/src/shared/models/cards';
import { Hand as HandSolver } from 'pokersolver';
import { logger } from '../logger';

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

    // return 1 if hand1 is winner, -1 if hand2 is winner, 0 if tie
    compareHands(hand1: Hand, hand2: Hand): number {
        const winners = HandSolver.winners([hand1, hand2]);
        if (winners.length !== 1) return 0;
        if (winners[0] === hand1) return 1;
        if (winners[0] === hand2) return -1;
        logger.warn('unexpected result from hand comparison, returning 0');
        return 0;
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
