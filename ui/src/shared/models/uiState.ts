import { Card, genRandomCard } from "./cards";
import { ActionType } from "./wsaction";
import { genRandomInt } from "../util/util";

export declare interface UiGameState {
    controller: Controller;
    table: Table;
}

export declare interface Controller {
    min: number;
    max: number;
    pot: number;
    sizingButtons: SizingButton[];
    actionButtons: ActionButton[];

    toAct?: boolean;
    unsetCheckCall?: boolean;
}

export declare interface SizingButton {
    label: string;
    value: number;
}

export declare interface ActionButton {
    label: string;
    action: ActionType;
}

export declare interface Table {
    spots: number;
    pot: number;
    communityCards: Card[];
    players: Player[];

}

export declare interface Player {
    name: string;
    position: number;
    stack: number;

    hero?: boolean;
    toAct?: boolean;
    button?: boolean;
    winner?: boolean;
    bet?: number;
    handLabel?: string;
    timeLimit?: number;

    hand: {
        cards: Card[];
    };
}

export const TestGame: UiGameState = {
    controller: {
        toAct: true,
        unsetCheckCall: true,
        min: 25,
        max: 43000,
        pot: 12000,
        sizingButtons: [
            {
                label: "1/2",
                value: 6000,
            },
            {
                label: "3/4",
                value: 9000,
            },
            {
                label: "Pot",
                value: 12000,
            },
            {
                label: "All In",
                value: 43000,
            },
        ],
        actionButtons: [
            {
                action: ActionType.FOLD,
                label: "Fold",
            },
            {
                action: ActionType.CHECK,
                label: "Check",
            },
            {
                action: ActionType.BET,
                label: "Bet",
            },
        ],
    },
    table: {
        spots: 9,
        pot: 12000,
        communityCards: [
            genRandomCard(),
            genRandomCard(),
            genRandomCard(),
            genRandomCard(),
            genRandomCard(),
        ],
        players: [
            {
                name: "Rick Dolo",
                position: 0,
                stack: 5500,
                toAct: true,
                timeLimit: 30,
                handLabel: "Set of Kings",
                bet: genRandomInt(0, 10),
                hand: {
                    cards: [genRandomCard(), genRandomCard()],
                },
            },
            {
                name: "Marty Shakus",
                position: 1,
                stack: 425323,
                bet: genRandomInt(0, 100),
                handLabel: "Four of a Kind",
                hand: {
                    cards: [genRandomCard(), genRandomCard()],
                },
            },
            {
                name: "Dean Markus",
                position: 2,
                stack: 323,
                bet: genRandomInt(0, 1000),
                handLabel: "Straight Flush",
                hand: {
                    cards: [genRandomCard(), genRandomCard()],
                },
            },
            {
                name: "Tommy Bones",
                position: 3,
                stack: 323,
                bet: genRandomInt(0, 10000),
                hand: {
                    cards: [genRandomCard(), genRandomCard()],
                },
            },
            {
                button: true,
                name: "Langus Yanger",
                position: 4,
                stack: 323,
                bet: genRandomInt(0, 100000),
                handLabel: "Top Two",
                hand: {
                    cards: [genRandomCard(), genRandomCard()],
                },
            },

            {
                hero: true,
                name: "Jimmy Dean",
                position: 6,
                stack: 43020,
                bet: genRandomInt(0, 1000000),
                handLabel: "Three Queens",
                hand: {
                    cards: [genRandomCard(), genRandomCard()],
                },
            },
            {
                name: "Nicki Lam",
                stack: 20499,
                position: 7,
                bet: genRandomInt(0, 1000000000000),
                hand: {
                    cards: [genRandomCard(), genRandomCard()],
                },
            },
        ],
    },
};

export const CleanGame = {
    controller: {
        toAct: false,
        unsetCheckCall: true,
        min: 0,
        max: 0,
        pot: 0,
        sizingButtons: [],
        actionButtons: [],
    },
    table: {
        spots: 9,
        pot: 0,
        communityCards: [],
        players: [],
    },
};
