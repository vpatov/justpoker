import { genRandomInt } from '../util/util';

export declare interface Deck {
    cards: Card[];
}

export declare interface Card {
    readonly suit: Suit;
    readonly rank: string;
    visible?: boolean; // is card globally visible
}

export enum Suit {
    HEARTS = 'HEARTS',
    DIAMONDS = 'DIAMONDS',
    SPADES = 'SPADES',
    CLUBS = 'CLUBS',
}

export declare interface Hand {
    name: string;
    descr: string;
    cards: PokerSolverCard[];
}

export declare interface PokerSolverCard {
    /** The string 'value' of the card i.e. 5, 7, K, Q, A, ...*/
    value: string;

    /** The string suit of the card i.e. S, C, D, H */
    suit: string;

    /**
     * The numeric value of the rank, i.e. 0-13. It would be more accurate if the rank and value
     * variable names were switched (this interface represents the pokersolver definitions)
     */
    rank: number;

    /** Not in use by JustPoker. */
    wildValue: string;
}

export const SUIT_ABBREVIATIONS = {
    [Suit.HEARTS]: 'h',
    [Suit.DIAMONDS]: 'd',
    [Suit.SPADES]: 's',
    [Suit.CLUBS]: 'c',
};

export const BASE_DECK: Card[] = [
    { suit: Suit.HEARTS, rank: '2' },
    { suit: Suit.HEARTS, rank: '3' },
    { suit: Suit.HEARTS, rank: '4' },
    { suit: Suit.HEARTS, rank: '5' },
    { suit: Suit.HEARTS, rank: '6' },
    { suit: Suit.HEARTS, rank: '7' },
    { suit: Suit.HEARTS, rank: '8' },
    { suit: Suit.HEARTS, rank: '9' },
    { suit: Suit.HEARTS, rank: 'T' },
    { suit: Suit.HEARTS, rank: 'J' },
    { suit: Suit.HEARTS, rank: 'Q' },
    { suit: Suit.HEARTS, rank: 'K' },
    { suit: Suit.HEARTS, rank: 'A' },
    { suit: Suit.DIAMONDS, rank: '2' },
    { suit: Suit.DIAMONDS, rank: '3' },
    { suit: Suit.DIAMONDS, rank: '4' },
    { suit: Suit.DIAMONDS, rank: '5' },
    { suit: Suit.DIAMONDS, rank: '6' },
    { suit: Suit.DIAMONDS, rank: '7' },
    { suit: Suit.DIAMONDS, rank: '8' },
    { suit: Suit.DIAMONDS, rank: '9' },
    { suit: Suit.DIAMONDS, rank: 'T' },
    { suit: Suit.DIAMONDS, rank: 'J' },
    { suit: Suit.DIAMONDS, rank: 'Q' },
    { suit: Suit.DIAMONDS, rank: 'K' },
    { suit: Suit.DIAMONDS, rank: 'A' },
    { suit: Suit.CLUBS, rank: '2' },
    { suit: Suit.CLUBS, rank: '3' },
    { suit: Suit.CLUBS, rank: '4' },
    { suit: Suit.CLUBS, rank: '5' },
    { suit: Suit.CLUBS, rank: '6' },
    { suit: Suit.CLUBS, rank: '7' },
    { suit: Suit.CLUBS, rank: '8' },
    { suit: Suit.CLUBS, rank: '9' },
    { suit: Suit.CLUBS, rank: 'T' },
    { suit: Suit.CLUBS, rank: 'J' },
    { suit: Suit.CLUBS, rank: 'Q' },
    { suit: Suit.CLUBS, rank: 'K' },
    { suit: Suit.CLUBS, rank: 'A' },
    { suit: Suit.SPADES, rank: '2' },
    { suit: Suit.SPADES, rank: '3' },
    { suit: Suit.SPADES, rank: '4' },
    { suit: Suit.SPADES, rank: '5' },
    { suit: Suit.SPADES, rank: '6' },
    { suit: Suit.SPADES, rank: '7' },
    { suit: Suit.SPADES, rank: '8' },
    { suit: Suit.SPADES, rank: '9' },
    { suit: Suit.SPADES, rank: 'T' },
    { suit: Suit.SPADES, rank: 'J' },
    { suit: Suit.SPADES, rank: 'Q' },
    { suit: Suit.SPADES, rank: 'K' },
    { suit: Suit.SPADES, rank: 'A' },
];

export function genRandomCard(): Card {
    return BASE_DECK[genRandomInt(0, 51)];
}

export function suitLetterToSuit(suitLetter: string): Suit {
    switch (suitLetter.toUpperCase()) {
        case 'S':
            return Suit.SPADES;
        case 'H':
            return Suit.HEARTS;
        case 'C':
            return Suit.CLUBS;
        case 'D':
            return Suit.DIAMONDS;
        default:
            throw Error(`Cannot convert suitLetter: ${suitLetter} to suit enum.`);
    }
}

export function cardsAreEqual(cardA: Card, cardB: Card): boolean {
    return cardA.rank === cardB.rank && cardA.suit === cardB.suit;
}

export function getTwoCardCombinations(holeCards: Readonly<Card[]>): Card[][] {
    const combinations: Card[][] = [];
    for (let i = 0; i < holeCards.length; i += 1) {
        for (let j = i + 1; j < holeCards.length; j += 1) {
            combinations.push([holeCards[i], holeCards[j]]);
        }
    }
    return combinations;
}

export function convertHandToCardArray(hand: Hand): Card[] {
    return hand.cards.map((pokerSolverCard) => ({
        suit: suitLetterToSuit(pokerSolverCard.suit),
        rank: pokerSolverCard.value,
    }));
}
