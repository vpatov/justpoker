import React, { useEffect } from "react";
import { Howl } from "howler";

import { SoundsAction, GameExp } from "./shared/models/gameExp";
import { Subscribe } from "./api/ws";

const SRC_PATH = `${process.env.PUBLIC_URL}/sounds`;
const ACTION_TO_PATH = {
    [SoundsAction.CHECK]: `${SRC_PATH}/check.mp3`,
    [SoundsAction.BET]: `${SRC_PATH}/bet.mp3`,
    [SoundsAction.FOLD]: `${SRC_PATH}/fold.mp3`,
    [SoundsAction.CALL]: `${SRC_PATH}/call.mp3`,
};

const ACTION_TO_AUDIO = {};

// init ACTION_TO_AUDIO
for (const [action, path] of Object.entries(ACTION_TO_PATH)) {
    ACTION_TO_AUDIO[action] = new Howl({ src: [path] });
}

function GameExpModule(props) {
    useEffect(() => {
        Subscribe("exp", onReceiveNewExp);
    }, []);

    const onReceiveNewExp = (exp: GameExp) => {
        const audio = ACTION_TO_AUDIO[exp.sounds.global];
        if (audio) {
            console.log("playing", exp.sounds.global);

            audio.play();
        }
    };

    return null;
}

export default GameExpModule;
