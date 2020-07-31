import { selectUseCents } from '../store/selectors';
import { useSelector } from 'react-redux';

export function useChipFormatter(chips: number) {
    const useCents = useSelector(selectUseCents);
    if (useCents) {
        const amt = chips / 100;
        return amt.toFixed(2);
    }
    return `${chips}`;
}
