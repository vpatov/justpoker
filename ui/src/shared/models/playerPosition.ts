/** Used to determine the name of the player's position at the table. Depends on the amount of people playing. */
export enum PlayerPosition {
    'SB' = 'SB',
    'BB' = 'BB',
    'UTG' = 'UTG',
    'UTG+1' = 'UTG+1',
    'UTG+2' = 'UTG+2',
    'MP' = 'MP',
    'MP+1' = 'MP+1',
    'LJ' = 'LJ',
    'HJ' = 'HJ',
    'CUTOFF' = 'CUTOFF',
    'DEALER' = 'DEALER',
    'NOT_PLAYING' = 'NOT_PLAYING',
}

// Local abbreviation for convenience
const PP = PlayerPosition;

/** Map player position enum to string representation. */
export const PlayerPositionString: { [key in PlayerPosition]: string } = {
    [PP.DEALER]: 'Dealer',
    [PP.SB]: 'Small Blind',
    [PP.BB]: 'Big Blind',
    [PP.UTG]: 'Under The Gun',
    [PP['UTG+1']]: 'Under The Gun +1',
    [PP['UTG+2']]: 'Under The Gun +2',
    [PP.MP]: 'Middle Position',
    [PP['MP+1']]: 'Late Middle Position',
    [PP.LJ]: 'Lojack',
    [PP.HJ]: 'Hijack',
    [PP.CUTOFF]: 'Cutoff',
    [PP.NOT_PLAYING]: 'Not Playing',
};

/** Hardcoded map of player positions with respect to how many people are at the table. */
export const PLAYER_POSITIONS_BY_HEADCOUNT: { [key: number]: PlayerPosition[] } = {
    2: [PP.DEALER, PP.BB],
    3: [PP.DEALER, PP.SB, PP.BB],
    4: [PP.DEALER, PP.SB, PP.BB, PP.UTG],
    5: [PP.DEALER, PP.SB, PP.BB, PP.UTG, PP.CUTOFF],
    6: [PP.DEALER, PP.SB, PP.BB, PP.UTG, PP.MP, PP.CUTOFF],
    7: [PP.DEALER, PP.SB, PP.BB, PP.UTG, PP.MP, PP.HJ, PP.CUTOFF],
    8: [PP.DEALER, PP.SB, PP.BB, PP.UTG, PP['UTG+1'], PP.MP, PP.HJ, PP.CUTOFF],
    9: [PP.DEALER, PP.SB, PP.BB, PP.UTG, PP['UTG+1'], PP.MP, PP['MP+1'], PP.HJ, PP.CUTOFF],
    10: [PP.DEALER, PP.SB, PP.BB, PP.UTG, PP['UTG+1'], PP.MP, PP['MP+1'], PP.LJ, PP.HJ, PP.CUTOFF],
    11: [PP.DEALER, PP.SB, PP.BB, PP.UTG, PP['UTG+1'], PP['UTG+2'], PP.MP, PP['MP+1'], PP.LJ, PP.HJ, PP.CUTOFF],
};
