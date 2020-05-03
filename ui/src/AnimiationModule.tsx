import anime from 'animejs/lib/anime.es.js';

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

function getCenterOfTable() {
    const { bottom, left, right, top } = document.getElementsByClassName('ani_table')[0].getBoundingClientRect();
    const x = (right - left) / 2 + left;
    const y = (top - bottom) / 2 + bottom;
    return [x, y];
}

export function dealCards() {
    const duration = 1800;

    const [x, y] = getCenterOfTable();

    const a = anime({
        targets: ['.ani_playerCard_0', '.ani_playerCard_1'],
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
    // setTimeout(() => a.reset(), duration);
}
