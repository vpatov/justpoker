import { genRandomInt } from "../util/util";

export declare interface Deck {
  cards: Card[];
}

export declare interface Card {
  readonly suit: Suit;
  readonly rank: string;
}

export enum Suit {
  HEARTS = "HEARTS",
  DIAMONDS = "DIAMONDS",
  SPADES = "SPADES",
  CLUBS = "CLUBS",
}

export const SUIT_ABBREVIATIONS = {
  [Suit.HEARTS]: "h",
  [Suit.DIAMONDS]: "d",
  [Suit.SPADES]: "s",
  [Suit.CLUBS]: "c",
};

export const BASE_DECK: Card[] = [
  { suit: Suit.HEARTS, rank: "2" },
  { suit: Suit.HEARTS, rank: "3" },
  { suit: Suit.HEARTS, rank: "4" },
  { suit: Suit.HEARTS, rank: "5" },
  { suit: Suit.HEARTS, rank: "6" },
  { suit: Suit.HEARTS, rank: "7" },
  { suit: Suit.HEARTS, rank: "8" },
  { suit: Suit.HEARTS, rank: "9" },
  { suit: Suit.HEARTS, rank: "T" },
  { suit: Suit.HEARTS, rank: "J" },
  { suit: Suit.HEARTS, rank: "Q" },
  { suit: Suit.HEARTS, rank: "K" },
  { suit: Suit.HEARTS, rank: "A" },
  { suit: Suit.DIAMONDS, rank: "2" },
  { suit: Suit.DIAMONDS, rank: "3" },
  { suit: Suit.DIAMONDS, rank: "4" },
  { suit: Suit.DIAMONDS, rank: "5" },
  { suit: Suit.DIAMONDS, rank: "6" },
  { suit: Suit.DIAMONDS, rank: "7" },
  { suit: Suit.DIAMONDS, rank: "8" },
  { suit: Suit.DIAMONDS, rank: "9" },
  { suit: Suit.DIAMONDS, rank: "T" },
  { suit: Suit.DIAMONDS, rank: "J" },
  { suit: Suit.DIAMONDS, rank: "Q" },
  { suit: Suit.DIAMONDS, rank: "K" },
  { suit: Suit.DIAMONDS, rank: "A" },
  { suit: Suit.CLUBS, rank: "2" },
  { suit: Suit.CLUBS, rank: "3" },
  { suit: Suit.CLUBS, rank: "4" },
  { suit: Suit.CLUBS, rank: "5" },
  { suit: Suit.CLUBS, rank: "6" },
  { suit: Suit.CLUBS, rank: "7" },
  { suit: Suit.CLUBS, rank: "8" },
  { suit: Suit.CLUBS, rank: "9" },
  { suit: Suit.CLUBS, rank: "T" },
  { suit: Suit.CLUBS, rank: "J" },
  { suit: Suit.CLUBS, rank: "Q" },
  { suit: Suit.CLUBS, rank: "K" },
  { suit: Suit.CLUBS, rank: "A" },
  { suit: Suit.SPADES, rank: "2" },
  { suit: Suit.SPADES, rank: "3" },
  { suit: Suit.SPADES, rank: "4" },
  { suit: Suit.SPADES, rank: "5" },
  { suit: Suit.SPADES, rank: "6" },
  { suit: Suit.SPADES, rank: "7" },
  { suit: Suit.SPADES, rank: "8" },
  { suit: Suit.SPADES, rank: "9" },
  { suit: Suit.SPADES, rank: "T" },
  { suit: Suit.SPADES, rank: "J" },
  { suit: Suit.SPADES, rank: "Q" },
  { suit: Suit.SPADES, rank: "K" },
  { suit: Suit.SPADES, rank: "A" },
];

export function genRandomCard(): Card {
  return BASE_DECK[genRandomInt(0, 51)];
}
