export declare interface Deck {
  cards: Card[];
}

export declare interface Card {
  readonly suit: Suit;
  readonly rank: number;
}

export const enum Suit {
  HEARTS = "HEARTS",
  DIAMONDS = "DIAMONDS",
  SPADES = "SPADES",
  CLUBS = "CLUBS",
}

export const BASE_DECK: Card[] = [
  { suit: Suit.HEARTS, rank: 1 },
  { suit: Suit.HEARTS, rank: 2 },
  { suit: Suit.HEARTS, rank: 3 },
  { suit: Suit.HEARTS, rank: 4 },
  { suit: Suit.HEARTS, rank: 5 },
  { suit: Suit.HEARTS, rank: 6 },
  { suit: Suit.HEARTS, rank: 7 },
  { suit: Suit.HEARTS, rank: 8 },
  { suit: Suit.HEARTS, rank: 9 },
  { suit: Suit.HEARTS, rank: 10 },
  { suit: Suit.HEARTS, rank: 11 },
  { suit: Suit.HEARTS, rank: 12 },
  { suit: Suit.HEARTS, rank: 13 },
  { suit: Suit.DIAMONDS, rank: 1 },
  { suit: Suit.DIAMONDS, rank: 2 },
  { suit: Suit.DIAMONDS, rank: 3 },
  { suit: Suit.DIAMONDS, rank: 4 },
  { suit: Suit.DIAMONDS, rank: 5 },
  { suit: Suit.DIAMONDS, rank: 6 },
  { suit: Suit.DIAMONDS, rank: 7 },
  { suit: Suit.DIAMONDS, rank: 8 },
  { suit: Suit.DIAMONDS, rank: 9 },
  { suit: Suit.DIAMONDS, rank: 10 },
  { suit: Suit.DIAMONDS, rank: 11 },
  { suit: Suit.DIAMONDS, rank: 12 },
  { suit: Suit.DIAMONDS, rank: 13 },
  { suit: Suit.CLUBS, rank: 1 },
  { suit: Suit.CLUBS, rank: 2 },
  { suit: Suit.CLUBS, rank: 3 },
  { suit: Suit.CLUBS, rank: 4 },
  { suit: Suit.CLUBS, rank: 5 },
  { suit: Suit.CLUBS, rank: 6 },
  { suit: Suit.CLUBS, rank: 7 },
  { suit: Suit.CLUBS, rank: 8 },
  { suit: Suit.CLUBS, rank: 9 },
  { suit: Suit.CLUBS, rank: 10 },
  { suit: Suit.CLUBS, rank: 11 },
  { suit: Suit.CLUBS, rank: 12 },
  { suit: Suit.CLUBS, rank: 13 },
  { suit: Suit.SPADES, rank: 1 },
  { suit: Suit.SPADES, rank: 2 },
  { suit: Suit.SPADES, rank: 3 },
  { suit: Suit.SPADES, rank: 4 },
  { suit: Suit.SPADES, rank: 5 },
  { suit: Suit.SPADES, rank: 6 },
  { suit: Suit.SPADES, rank: 7 },
  { suit: Suit.SPADES, rank: 8 },
  { suit: Suit.SPADES, rank: 9 },
  { suit: Suit.SPADES, rank: 10 },
  { suit: Suit.SPADES, rank: 11 },
  { suit: Suit.SPADES, rank: 12 },
  { suit: Suit.SPADES, rank: 13 },
];
