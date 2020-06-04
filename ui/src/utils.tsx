import { useEffect, useRef, useState } from 'react';

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

export function useStickyState(defaultValue, key) {
    const [value, setValue] = useState(() => {
        const stickyValue = window.localStorage.getItem(key);
        console.log(stickyValue, stickyValue === '');
        // block crash for parse empty string
        try {
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        } catch (e) {
            return stickyValue;
        }
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
}

export default usePrevious;
