import { Service } from 'typedi';
import {
    Card,
    Hand,
    SUIT_ABBREVIATIONS,
    getTwoCardCombinations,
    reformatHandDescription,
    getThreeCardCombinations,
} from '../../../ui/src/shared/models/game/cards';
import { Hand as HandSolver } from 'pokersolver';
import { logger, timeFunc } from '../logger';

// TODO declare types for this module and make an npm package

@Service()
export class HandSolverService {
    private computeBestHandFromCards(cards: Card[]): Hand {
        const strCards = cards.map((card) => `${card.rank}${SUIT_ABBREVIATIONS[card.suit]}`);
        return this.computeBestHandFromStrCards(strCards);
    }

    computeBestHandFromStrCards(cards: string[]): Hand {
        const hand = HandSolver.solve(cards);
        hand.descr = reformatHandDescription(hand.descr);
        return hand;
    }

    getWinningHands(hands: Hand[]): Hand[] {
        return HandSolver.winners(hands);
    }

    // return 1 if hand1 is winner, -1 if hand2 is winner, 0 if tie
    compareHands(hand1: Hand, hand2: Hand): number {
        const winners = HandSolver.winners([hand1, hand2]);
        const err = Error(
            `unexpected result in HandSolverService.compareHands, args: ${JSON.stringify(hand1)}, ${JSON.stringify(
                hand2,
            )}`,
        );
        if (winners.length === 0 || winners.length > 2) {
            logger.error(err.message);
            throw err;
        }
        if (winners.length === 2) return 0;
        if (winners[0] === hand1) return 1;
        if (winners[0] === hand2) return -1;

        logger.error(err.message);
        throw err;
    }

    @timeFunc()
    computeBestNLEHand(holeCards: Readonly<Card[]>, board: Readonly<Card[]>) {
        return this.computeBestHandFromCards([...holeCards, ...board]);
    }

    @timeFunc()
    computeBestPLOHand(holeCards: Readonly<Card[]>, board: Readonly<Card[]>) {
        const holeCardCombos = getTwoCardCombinations(holeCards);
        const boardCombos = board ? getThreeCardCombinations(board) : [];
        const bestHands = [];
        if (boardCombos.length > 0) {
            for (const holeCardCombo of holeCardCombos) {
                for (const boardCombo of boardCombos) {
                    bestHands.push(this.computeBestHandFromCards([...holeCardCombo, ...boardCombo]));
                }
            }
        } else {
            for (const holeCardCombo of holeCardCombos) {
                bestHands.push(this.computeBestHandFromCards([...holeCardCombo]));
            }
        }

        const winningHands = this.getWinningHands(bestHands);
        if (!winningHands.length) {
            throw Error(
                `computeBestPLOHand is returning undefined winner. holeCards.length: ${holeCards.length}, board.length: ${board.length}`,
            );
        }
        return winningHands[0];
    }
}
