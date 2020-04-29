import anime from "animejs/lib/anime.es.js";

export function flipTable() {
    const animations = [] as any;
    const duration = 5000;
    const resetDuration = 6000;
    animations.push(
        anime({
            targets: ".ani_table",
            translateY: window.innerHeight * -1.5,
            rotateX: "3turn",
            duration: duration,
            easing: "easeOutCubic",
        })
    );
    animations.push(
        anime({
            targets: [".ani_chipStack", ".ani_betLabel"],
            translateX: () => window.innerWidth * (Math.random() * 2 - 1),
            translateY: () => window.innerHeight * (Math.random() * 2 - 1),
            rotate: "2turn",
            duration: duration,
            easing: "easeOutCubic",
        })
    );

    setTimeout(() => {
        animations.forEach((a) => a.reset());
    }, resetDuration);
}
