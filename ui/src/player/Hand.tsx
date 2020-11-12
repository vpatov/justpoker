import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CardSmall from './CardSmall';
import classnames from 'classnames';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        transform: 'translateZ(-1px)', // need for proper deal animation in safari
    },
    folded: {
        opacity: 0,
        transition: 'opacity 0.1s ease-in-out',
    },
    heroCard: {
        transform: 'scale(1.25)',
    },
}));

function Hand(props) {
    const classes = useStyles();
    const { hand, hero, className, cannotHideCards, playerUUID } = props;
    const { cards } = hand;

    const shouldRotate = hero && cards.length === 4;
    return (
        <div className={classnames(classes.root, className, { [classes.heroCard]: hero })}>
            {cards.map((c, i) => (
                <CardSmall
                    {...c}
                    key={`${JSON.stringify(c)}-${playerUUID}-${i}`}
                    cannotHideCards={cannotHideCards}
                    size="small"
                    className={`ani_playerCard_${i}`}
                    shouldFlex={cards.length > 2}
                    hero={hero}
                    style={
                        shouldRotate
                            ? {
                                  transform: `rotateZ(${(-12 + i * 8) * 0.7}deg) translateY(${
                                      Math.pow(-12 + i * 8, 2) * 0.003
                                  }vmin)`,
                              }
                            : {}
                    }
                />
            ))}
        </div>
    );
}

export default Hand;
