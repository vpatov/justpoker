import { useEffect, useRef } from 'react';

export const SUITS = {
    HEARTS: 'HEARTS',
    SPADES: 'SPADES',
    CLUBS: 'CLUBS',
    DIAMONDS: 'DIAMONDS',
};

export function generateStringFromSuit(suit) {
    let suitString = 'ERR_SUIT';
    switch (suit) {
        case SUITS.HEARTS:
            suitString = '\u2665';
            break;
        case SUITS.SPADES:
            suitString = '\u2660';
            break;
        case SUITS.CLUBS:
            suitString = '\u2663';
            break;
        case SUITS.DIAMONDS:
            suitString = '\u2666';
            break;
    }

    return suitString;
}

export function generateStringFromRank(rank) {
    if (rank === 'T') return '10';
    return rank;
}

export function usePrevious<T>(value: T): T {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current as T;
}

export default usePrevious;
