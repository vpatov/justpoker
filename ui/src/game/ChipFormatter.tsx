import { selectUseCents } from '../store/selectors';
import { useSelector } from 'react-redux';

export function useChipFormatter(usePassCents?: boolean): (number) => string {
    const stateUseCents = useSelector(selectUseCents);
    const useCents = usePassCents || stateUseCents;

    if (useCents) {
        return formatCents;
    }
    return formatNormal;
}

function formatCents(amt: number): string {
    const newAmt = amt / 100;
    return newAmt.toFixed(2).toLocaleString();
}

function formatNormal(amt: number): string {
    return amt.toLocaleString();
}
