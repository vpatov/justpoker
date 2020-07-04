import { Service } from 'typedi';
import { Card, Deck, BASE_DECK, SUIT_ABBREVIATIONS, Suit } from '../../../ui/src/shared/models/game/cards';

@Service()
// TODO Clearly define what does "Service", "Manager", "Helper" mean.
export class DeckService {
    newDeck(): Deck {
        const deck = { cards: [...BASE_DECK] };
        this.shuffleDeck(deck);
        return deck;
    }

    shuffleDeck(deck: Deck): void {
        let i, j = 0;
        let temp = null;
        const cards = deck.cards;

        for (i = cards.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = cards[i];
            cards[i] = cards[j];
            cards[j] = temp;
        }
    }

    drawCard(deck: Deck): Card {
        return deck.cards.pop();
    }

    private testDeck(): Deck {
        throw Error('Remove this line to allow calling this method.');
        const deck: Deck = {
            cards: [
                ...BASE_DECK,

                { suit: Suit.CLUBS, rank: '3' },
                { suit: Suit.SPADES, rank: '4' },
                { suit: Suit.DIAMONDS, rank: '5' },
                { suit: Suit.SPADES, rank: '7' },
                { suit: Suit.HEARTS, rank: '9' },

                // player 3
                { suit: Suit.HEARTS, rank: 'J' },
                { suit: Suit.CLUBS, rank: 'J' },

                // player 2
                { suit: Suit.HEARTS, rank: 'Q' },
                { suit: Suit.CLUBS, rank: 'Q' },

                // player 1
                { suit: Suit.HEARTS, rank: 'A' },
                { suit: Suit.CLUBS, rank: 'A' },
            ],
        };
        return deck;
    }
}
