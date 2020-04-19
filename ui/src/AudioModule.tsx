import React, { useEffect } from "react";
import { Howl } from "howler";

import { SoundByte, AudioQueue } from "./shared/models/audioQueue";
import { Subscribe } from "./api/ws";

const SRC_PATH = `${process.env.PUBLIC_URL}/sounds/guitar_theme`;
const ACTION_TO_PATH = {
    [SoundByte.CHECK]: `${SRC_PATH}/check.mp3`,
    [SoundByte.BET]: `${SRC_PATH}/bet.mp3`,
    [SoundByte.FOLD]: `${SRC_PATH}/fold.mp3`,
    [SoundByte.CALL]: `${SRC_PATH}/call.mp3`,
};

const ACTION_TO_AUDIO = {};

// init ACTION_TO_AUDIO
for (const [action, path] of Object.entries(ACTION_TO_PATH)) {
    ACTION_TO_AUDIO[action] = new Howl({ src: [path] });
}

function AudioModule(props) {
    useEffect(() => {
        Subscribe("audio", onReceiveNewAudioState);
    }, []);

    const onReceiveNewAudioState = (audioState: AudioQueue) => {
        const audio = ACTION_TO_AUDIO[audioState.global];
        if (audio) {
            console.log("playing", audioState.global);

            audio.play();
        }
    };

    return null;
}

export default AudioModule;
