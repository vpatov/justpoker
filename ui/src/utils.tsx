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

export function usePrevious(value) {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef();
    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes
    // Return previous value (happens before update in useEffect above)
    return ref.current;
}
