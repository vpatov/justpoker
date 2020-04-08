export const SUITS = {
  HEARTS: "HEARTS",
  SPADES: "SPADES",
  CLUBS: "CLUBS",
  DIAMONDS: "DIAMONDS",
};

export function generateStringFromSuitNumber(suit, number) {
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

  if (2 <= number && number <= 10) {
    numberString = `${number}`;
  } else {
    switch (number) {
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
