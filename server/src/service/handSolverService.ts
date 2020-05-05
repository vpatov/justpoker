import { Service } from 'typedi';
import { Card, Hand, SUIT_ABBREVIATIONS, suitLetterToSuit } from '../../../ui/src/shared/models/cards';
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
        const twoCardCombinations = this.getTwoCardCombinations(holeCards);
        const bestHands = twoCardCombinations.map((twoCards) => this.computeBestHandFromCards([...twoCards, ...board]));
        const winningHands = this.getWinningHands(bestHands);
        return winningHands[0];
    }

    getTwoCardCombinations(holeCards: Readonly<Card[]>): Card[][] {
        const combinations = [];
        for (let i = 0; i < holeCards.length; i += 1) {
            for (let j = i + 1; j < holeCards.length; j += 1) {
                combinations.push([holeCards[i], holeCards[j]]);
            }
        }
        return combinations;
    }

    convertHandToCardArray(hand: Hand): Card[] {
        return hand.cards.map((pokerSolverCard) => ({
            suit: suitLetterToSuit(pokerSolverCard.suit),
            rank: pokerSolverCard.value,
        }));
    }
}
