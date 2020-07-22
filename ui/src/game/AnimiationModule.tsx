import { useEffect } from 'react';
import { WsServer } from '../api/ws';
import { AnimationType, AnimationState, GameplayTrigger } from '../shared/models/state/animationState';

import anime from 'animejs/lib/anime.es.js';

function AnimiationModule(props) {
    useEffect(() => {
        WsServer.subscribe('animation', onReceiveNewAnimationState);
    }, []);

    const onReceiveNewAnimationState = (animationState: AnimationState) => {
        switch (animationState.animationType) {
            case AnimationType.GAMEPLAY:
                handleGamePlayAnimation(animationState);
                break;
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
    switch (animationState.trigger) {
        case GameplayTrigger.DEAL_CARDS: {
            dealCards();
            break;
        }
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
    const duration = 1250;
    anime({
        targets: ['.ani_playerCard_0', '.ani_playerCard_1', '.ani_playerCard_2', '.ani_playerCard_3'],
        rotateY: [-110, 0],
        easing: 'easeOutExpo',
        duration: duration,
        opacity: [0.3, 1],
        delay: anime.stagger(25),
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
    return a;
}

export function animateWinningCard(cardId, partOfWinningHand) {
    const duration = 800;
    const fliter = partOfWinningHand ? 'brightness(1)' : ['brightness(1)', 'brightness(0.2)'];
    console.log(cardId, partOfWinningHand);
    anime({
        targets: [`#${cardId}`],
        filter: fliter,
        duration: duration,
        easing: 'easeInOutExpo',
    });
}

export function animateTimeBankButton() {
    const duration = 350;
    const loops = 4;
    const angle = 10;
    anime({
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
    anime({
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
    anime({
        targets: [`#${id}`],
        rotateY: [-180, 0],
        translateY: hero ? '-1.1vmin' : '0',
        easing: 'easeOutExpo',
    });
}

export function unflipCard(id, hero) {
    anime({
        targets: [`#${id}`],
        rotateY: [-180, 0],
        translateY: '0',
        easing: 'easeOutExpo',
    });
}

export function animateDealCommunityCard(id) {
    anime({
        targets: [`#${id}`],
        rotateY: [90, 0],
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
