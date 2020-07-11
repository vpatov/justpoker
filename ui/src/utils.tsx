import { useEffect, useRef, useState } from 'react';
import get from 'lodash/get';
import { getClientIp } from './api/http';

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

export class ScrollFixer {
    ref: any;
    wasScrolledToBottom: boolean;
    margin: number;
    constructor(ref: any, margin?: number) {
        this.ref = ref;
        this.wasScrolledToBottom = true;
        this.margin = margin || 5;
        const el = get(ref, 'current');
        if (el) {
            el.onscroll = () => {
                this.wasScrolledToBottom = this.isScrolledToBottom();
            };
        }
    }
    attemptScroll() {
        const el = get(this.ref, 'current');
        if (el) {
            // if el is scrolled to bottom, reset scroll to bottom
            if (this.wasScrolledToBottom) {
                el.scrollTop = el.scrollHeight - el.clientHeight;
            }
            this.wasScrolledToBottom = this.isScrolledToBottom();
        }
    }

    isScrolledToBottom() {
        const el = get(this.ref, 'current');
        if (el) {
            return el.scrollHeight - el.clientHeight <= el.scrollTop + this.margin;
        }
        return false;
    }
}

export function useClientIp(): any {
    const [ip, SET_ip] = useState('');

    useEffect(() => {
        getClientIp(
            (res) => SET_ip(res.data),
            () => SET_ip('**COULD NOT FETCH IP INFO**'),
        );
    }, []);

    return ip;
}
