export const SUITS = {
  HEARTS: "HEARTS",
  SPADES: "SPADES",
  CLUBS: "CLUBS",
  DIAMONDS: "DIAMONDS",
};

// TODO change ranks to 0-12 and change Ace to high card
// rather than low card
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

  if (2 <= rank && rank <= 10) {
    numberString = `${rank}`;
  } else {
    switch (rank) {
      case 1:
        numberString = "A";
        break;
      case 11:
        numberString = "J";
        break;
      case 12:
        numberString = "Q";
        break;
      case 13:
        numberString = "K";
        break;
    }
  }

  return numberString + suitString;
}
