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

export function getHoleCardNickname(cardA: Card, cardB: Card): string | undefined {
    const ranksToName: Record<string, string> = {
        // Pairs
        AA: 'Rockets',
        KK: 'Cowboys',
        QQ: 'Pair of Ladies',
        JJ: 'Jaybirds',
        TT: 'Dimes',
        '99': 'Popeyes',
        '88': 'Snowmen',
        '77': 'Honey Sticks',
        '66': 'Boots',
        '55': 'Nickels',
        '44': 'Sail Boats',
        '33': 'Crabs',
        '22': 'Deuces',
        // A-X
        AK: 'Big Slick',
        AQ: 'Ms. Slick',
        AJ: 'Apple Jacks',
        AT: 'Bookends',
        A9: 'Rounders',
        A8: "Dead Man's Hand",
        A7: 'Slapshot',
        A6: "Devil's Ace",
        A5: 'High Five',
        A4: 'Fake Aces',
        A3: 'Thraces',
        A2: 'Little Slick',

        // These sorta get stupid, prob dont need
        // // K-X
        // KQ: 'Marriage',
        // KJ: 'Kojak',
        // KT: 'Kens',
        // K9: 'Canine',
        // K8: 'Kates',
        // K7: 'Kevins',
        // K6: 'Kicks',
        // K5: 'Knives',
        // K4: 'Forks',
        // K3: 'King Crab',
        // K2: 'The Zepik',

        // // Q-X
        // QJ: 'Maverick',
        // QT: 'Q-Tips',
        // Q9: 'Quinine',
        // Q8: 'Kuwait',
        // Q7: 'Computer Hand',
        // Q6: 'Nesquik',
        // Q5: 'Granny May',
        // Q4: 'Forks',
        // Q3: 'King Crab',
        // Q2: 'Daisies',
    };

    if (cardA.rank === 'A' || cardA.rank === cardB.rank) return ranksToName[cardA.rank + cardB.rank];
    else if (cardB.rank === 'A') return ranksToName[cardB.rank + cardA.rank];
    return undefined;
}

export const RankAbbrToFullString: Record<string, string> = {
    // Pairs
    A: 'Ace',
    K: 'King',
    Q: 'Queen',
    J: 'Jack',
    '10': 'Ten',
    '9': 'Nine',
    '8': 'Eight',
    '7': 'Seven',
    '6': 'Six',
    '5': 'Five',
    '4': 'Four',
    '3': 'Three',
    '2': 'Two',
};

// removes unwanted characters from the description string
// and in full names of cards
export function makeNiceHandDescription(handDescription: string): string {
    // K High
    // Two pair, A's & Q's
    // Three of a Kind, 6's
    // Pair, 3's
    // Full House, 5's over 4's
    // Flush, Ah High
    // Straight, 8 High
    let description = handDescription;
    Object.entries(RankAbbrToFullString).forEach(([abbr, fullStr]) => {
        const regexStr = `${abbr}(h|d|s|c)|${abbr}(?!ind)`; // match abbr with flush suit (h|d|s|c) that follows OR match abbr by itself but not if 'ind' follows
        const regex = new RegExp(regexStr, 'g');
        description = description.replace(regex, fullStr);
    });
    description = description.replace(/'s/g, 's').replace(/Sixs/g, 'Sixes');

    return description;
}
