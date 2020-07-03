import { useEffect, useRef, useState } from 'react';

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

export function useFocus(): [any, Function] {
    const htmlElRef = useRef(null);
    const setFocus = () => {
        htmlElRef.current && (htmlElRef.current as any).focus();
    };

    return [htmlElRef, setFocus];
}

export function importAllFromRequire(r) {
    let images = {};
    r.keys().map((item, index) => {
        images[item.replace('./', '')] = r(item);
    });
    return images;
}
