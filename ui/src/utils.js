export const SUITS = {
  HEARTS: "HEARTS",
  SPADES: "SPADES",
  CLUBS: "CLUBS",
  DIAMONDS: "DIAMONDS",
};

export function generateStringFromSuitAndRank(suit, rank) {
  let suitString = "ERR_SUIT";
  let numberString = "ERR_NUMBER";
  switch (suit) {
    case SUITS.HEARTS:
      suitString = "\u2665";
      break;
    case SUITS.SPADES:
      suitString = "\u2660";
      break;
    case SUITS.CLUBS:
      suitString = "\u2663";
      break;
    case SUITS.DIAMONDS:
      suitString = "\u2666";
      break;
  }

  return (rank == 'T' ? '10' : rank) + suitString;
}
