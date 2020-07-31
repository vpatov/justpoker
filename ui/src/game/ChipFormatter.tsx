import { selectUseCents } from '../store/selectors';
import { useSelector } from 'react-redux';

export function useChipFormatter(): (number) => string {
    const useCents = useSelector(selectUseCents);

    if (useCents) {
        return formatCents;
    }
    return formatNormal;
}

function formatCents(amt: number): string {
    const newAmt = amt / 100;
    return newAmt.toFixed(2);
}

function formatNormal(amt: number): string {
    return amt + '';
}
