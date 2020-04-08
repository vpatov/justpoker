const TestGame = {
  missionControl: {
    heroStack: 5500,
    pot: 12000,
  },
  table: {
    spots: 9,
    pot: 12000,
    communityCards: [
      {
        suit: "CLUBS",
        number: 11,
      },
      {
        suit: "SPADES",
        number: 12,
      },
      {
        suit: "HEARTS",
        number: 1,
      },
      {
        suit: "DIAMONDS",
        number: 4,
      },
      {
        suit: "CLUBS",
        number: 2,
      },
    ],
    players: [
      {
        name: "Rick Dolo",
        position: 0,
        stack: 5500,
        toAct: true,
        bet: 100,
        hand: {
          cards: [
            {
              suit: "CLUBS",
              number: 11,
            },
            {
              suit: "CLUBS",
              number: 10,
            },
          ],
        },
      },
      {
        name: "Marty Shakus",
        position: 1,
        stack: 425323,
        bet: 18400,
        hand: {
          cards: [
            {
              suit: "HEARTS",
              number: 4,
            },
            {
              suit: "CLUBS",
              number: 2,
            },
          ],
        },
      },
      {
        name: "Dean Markus",
        position: 2,
        stack: 323,
        bet: 200,
        hand: {
          cards: [
            {
              suit: "DIAMONDS",
              number: 11,
            },
            {
              suit: "CLUBS",
              number: 12,
            },
          ],
        },
      },
      {
        name: "Tommy Bones",
        position: 3,
        stack: 323,
        bet: 100,
        hand: {
          cards: [
            {
              suit: "DIAMONDS",
              number: 1,
            },
            {
              suit: "DIAMONDS",
              number: 2,
            },
          ],
        },
      },
      {
        button: true,
        name: "Langus Yanger",
        position: 4,
        stack: 323,
        bet: 4500,

        hand: {
          cards: [
            {
              suit: "HEARTS",
              number: 6,
            },
            {
              suit: "HEARTS",
              number: 1,
            },
          ],
        },
      },
      // {
      //   name: "Don Chiko",
      //   position: 5,
      //   stack: 923423,
      //   bet: 4500,
      //   hand: {
      //     cards: [
      //       {
      //         suit: "SPADES",
      //         number: 3,
      //       },
      //       {
      //         suit: "SPADES",
      //         number: 12,
      //       },
      //     ],
      //   },
      // },
      {
        hero: true,
        name: "Jimmy Dean",
        position: 6,
        stack: 43020,
        bet: 4500,
        hand: {
          cards: [
            {
              suit: "DIAMONDS",
              number: 1,
            },
            {
              suit: "CLUBS",
              number: 6,
            },
          ],
        },
      },
      {
        name: "Nicki Lam",
        stack: 20440,
        position: 7,
        bet: 450,
        hand: {
          cards: [
            {
              suit: "HEARTS",
              number: 11,
            },
            {
              suit: "HEARTS",
              number: 12,
            },
          ],
        },
      },
      // {
      //   name: "Mhumngus",
      //   stack: 9175423,
      //   position: 8,
      //   bet: 999999,
      //   hand: {
      //     cards: [
      //       {
      //         suit: "HEARTS",
      //         number: 11,
      //       },
      //       {
      //         suit: "HEARTS",
      //         number: 12,
      //       },
      //     ],
      //   },
      // },
    ],
  },
};

export default TestGame;
