import { useEffect } from 'react';
import { WsServer } from '../api/ws';
import { AnimationType, AnimationState, GameplayTrigger } from '../shared/models/state/animationState';
import grey from '@material-ui/core/colors/grey';

import anime from 'animejs/lib/anime.es.js';

function AnimiationModule(props) {
    useEffect(() => {
        WsServer.subscribe('animation', onReceiveNewAnimationState);
    }, []);

    const onReceiveNewAnimationState = (animationState: AnimationState) => {
        switch (animationState.animationType) {
            case AnimationType.GAMEPLAY:
                handleGamePlayAnimation(animationState);
            case AnimationType.REACTION:
                break;
            case AnimationType.EMPTY:
                break;

            default:
                console.warn(`No animation provided for ${animationState}`);
                break;
        }
    };

    return null;
}

export default AnimiationModule;

function handleGamePlayAnimation(animationState: AnimationState) {
    if (animationState.trigger === GameplayTrigger.DEAL_CARDS) {
        dealCards();
    }
}

export function flipTable() {
    const animations = [] as any;
    const duration = 5000;
    const resetDuration = 6000;
    animations.push(
        anime({
            targets: '.ani_table',
            translateY: window.innerHeight * -1.5,
            rotateX: '3turn',
            duration: duration,
            easing: 'easeOutCubic',
        }),
    );
    animations.push(
        anime({
            targets: ['.ani_chipStack', '.ani_betLabel'],
            translateX: () => window.innerWidth * (Math.random() * 2 - 1),
            translateY: () => window.innerHeight * (Math.random() * 2 - 1),
            rotate: '2turn',
            duration: duration,
            easing: 'easeOutCubic',
        }),
    );

    setTimeout(() => {
        animations.forEach((a) => a.reset());
    }, resetDuration);
}

export function dealCards() {
    const duration = 1800;

    const [x, y] = getCenterOfTable();

    const a = anime({
        targets: ['.ani_playerCard_0', '.ani_playerCard_1', '.ani_playerCard_2', '.ani_playerCard_3'],
        translateX: (target) => {
            return [x - target.getBoundingClientRect().x, 0];
        },
        translateY: (target) => {
            return [y - target.getBoundingClientRect().y, 0];
        },
        opacity: [0, 1],
        duration: duration,
        rotateZ: [-720, 0],
        easing: 'easeOutExpo',
        delay: anime.stagger(50),
    });
}

export function animateAwardPot(winnerUUID, potId) {
    const duration = 3000;
    const player = document.getElementById(winnerUUID);
    const [x, y] = getCenterOfRef(player);

    const a = anime({
        targets: [`#${potId}`],
        translateX: (target) => {
            return x - getCenterOfRef(target)[0];
        },
        translateY: (target) => {
            return y - getCenterOfRef(target)[1];
        },
        opacity: 0,
        duration: duration,
        easing: 'easeInOutExpo',
    });
    // setTimeout(() => a.reset(), duration);
    return a;
}

export function animateWinningCards() {
    const duration = 800;

    const a = anime({
        targets: [`.ani_notWinningCard`],
        filter: ['brightness(1)', 'brightness(0.2)'],
        duration: duration,
        easing: 'easeInOutExpo',
    });
    // setTimeout(() => a.reset(), resetDuration);
    return a;
}

export function animateTimeBankButton() {
    const duration = 350;
    const loops = 4;
    const angle = 7;
    const a = anime({
        targets: [`.ani_timeBank`],
        rotate: [angle, 0, -1 * angle, 0],
        duration: duration,
        loop: loops,
        easing: 'linear',
    });
}

export function animateShowCard(id) {
    const duration = 1250;

    const [x, y] = getCenterOfTable();
    const scaleTowardsTable = 2;
    const a = anime({
        targets: [`#${id}`],
        translateX: (target) => {
            return (x - target.getBoundingClientRect().x) / scaleTowardsTable;
        },
        translateY: (target) => {
            return (y - target.getBoundingClientRect().y) / scaleTowardsTable;
        },
        duration: duration,
        rotateZ: [-360, 0],
        easing: 'easeOutExpo',
    });
}

export function flipCard(id, hero) {
    const duration = 300;

    const a = anime({
        targets: [`#${id}`],

        rotateY: [-180, 0],
        translateY: hero ? '-2vmin' : '0',
        easing: 'easeOutExpo',
    });
}
// utility functions

function getCenterOfRef(ref) {
    const { bottom, left, right, top } = ref.getBoundingClientRect();
    const x = (right - left) / 2 + left;
    const y = (top - bottom) / 2 + bottom;
    return [x, y];
}
function getCenterOfTable() {
    return getCenterOfRef(document.getElementsByClassName('ani_table')[0]);
}
