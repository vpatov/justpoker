"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typedi_1 = require("typedi");
const cards_1 = require("../models/cards");
let DeckService = class DeckService {
    newDeck() {
        const deck = { cards: [...cards_1.BASE_DECK] };
        this.shuffleDeck(deck);
        return deck;
    }
    shuffleDeck(deck) {
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
};
DeckService = __decorate([
    typedi_1.Service()
], DeckService);
exports.DeckService = DeckService;
//# sourceMappingURL=deckService.js.map