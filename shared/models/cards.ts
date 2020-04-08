export declare interface Deck {
  cards: Card[];
}

export declare interface Card {
  readonly suit: Suit;
  readonly rank: number;
}

export const enum Suit {
  HEART = "HEART",
  DIAMOND = "DIAMOND",
  SPADE = "SPADE",
  CLUB = "CLUB",
}

export const BASE_DECK: Card[] = [
  { suit: Suit.HEART, rank: 0 },
  { suit: Suit.HEART, rank: 1 },
  { suit: Suit.HEART, rank: 2 },
  { suit: Suit.HEART, rank: 3 },
  { suit: Suit.HEART, rank: 4 },
  { suit: Suit.HEART, rank: 5 },
  { suit: Suit.HEART, rank: 6 },
  { suit: Suit.HEART, rank: 7 },
  { suit: Suit.HEART, rank: 8 },
  { suit: Suit.HEART, rank: 9 },
  { suit: Suit.HEART, rank: 10 },
  { suit: Suit.HEART, rank: 11 },
  { suit: Suit.HEART, rank: 12 },
  { suit: Suit.DIAMOND, rank: 0 },
  { suit: Suit.DIAMOND, rank: 1 },
  { suit: Suit.DIAMOND, rank: 2 },
  { suit: Suit.DIAMOND, rank: 3 },
  { suit: Suit.DIAMOND, rank: 4 },
  { suit: Suit.DIAMOND, rank: 5 },
  { suit: Suit.DIAMOND, rank: 6 },
  { suit: Suit.DIAMOND, rank: 7 },
  { suit: Suit.DIAMOND, rank: 8 },
  { suit: Suit.DIAMOND, rank: 9 },
  { suit: Suit.DIAMOND, rank: 10 },
  { suit: Suit.DIAMOND, rank: 11 },
  { suit: Suit.DIAMOND, rank: 12 },
  { suit: Suit.CLUB, rank: 0 },
  { suit: Suit.CLUB, rank: 1 },
  { suit: Suit.CLUB, rank: 2 },
  { suit: Suit.CLUB, rank: 3 },
  { suit: Suit.CLUB, rank: 4 },
  { suit: Suit.CLUB, rank: 5 },
  { suit: Suit.CLUB, rank: 6 },
  { suit: Suit.CLUB, rank: 7 },
  { suit: Suit.CLUB, rank: 8 },
  { suit: Suit.CLUB, rank: 9 },
  { suit: Suit.CLUB, rank: 10 },
  { suit: Suit.CLUB, rank: 11 },
  { suit: Suit.CLUB, rank: 12 },
  { suit: Suit.SPADE, rank: 0 },
  { suit: Suit.SPADE, rank: 1 },
  { suit: Suit.SPADE, rank: 2 },
  { suit: Suit.SPADE, rank: 3 },
  { suit: Suit.SPADE, rank: 4 },
  { suit: Suit.SPADE, rank: 5 },
  { suit: Suit.SPADE, rank: 6 },
  { suit: Suit.SPADE, rank: 7 },
  { suit: Suit.SPADE, rank: 8 },
  { suit: Suit.SPADE, rank: 9 },
  { suit: Suit.SPADE, rank: 10 },
  { suit: Suit.SPADE, rank: 11 },
  { suit: Suit.SPADE, rank: 12 },
];
