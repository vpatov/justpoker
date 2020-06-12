import React, { Fragment } from 'react';
import Chip from './Chip';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { MAX_VALUES } from './shared/util/consts';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '7.5vmin',
        flexWrap: 'wrap',
        flexDirection: 'row-reverse',
    },
    svgCont: {
        position: 'relative',
        marginTop: '-3vmin',
        width: '2.5vmin',
        height: '5vmin',
    },
}));

function ChipStack(props) {
    const classes = useStyles();
    const { amount, className } = props;

    function generateAStackOfChips(chipSize, numChips): JSX.Element {
        const chips = [] as any;
        const chipOffest = 4;
        let yPos = 80;
        for (let i = 0; i < numChips; i++) {
            yPos -= chipOffest;
            const chipComp = <Chip amount={chipSize} yPos={`${yPos}%`} />;
            chips.push(chipComp);
        }
        return (
            <svg className={classnames(classes.svgCont, 'ani_chipStack')} viewBox="0 0 100 200">
                <Fragment> {chips}</Fragment>
            </svg>
        );
    }

    function generatesChipsStacksFromAmount(amount) {
        if (amount > MAX_VALUES.PLAYER_STACK) {
            return generateAStackOfChips(amount, 1);
        }
        const chipsStacks = [] as any;
        let remaining = amount;

        for (let j = 0; remaining > 0; j++) {
            const bigChip = Math.pow(10, Math.floor(Math.log10(remaining)));
            const numBigChips = Math.floor(remaining / bigChip);

            chipsStacks.push(generateAStackOfChips(bigChip, numBigChips));
            remaining = remaining % bigChip;
        }

        return chipsStacks;
    }
    return <div className={classnames(classes.root, className)}>{generatesChipsStacksFromAmount(amount)}</div>;
}

export default ChipStack;
