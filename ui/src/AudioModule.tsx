import React, { useEffect } from 'react';
import { Howl } from 'howler';
import { SoundByte, AudioQueue } from './shared/models/audioQueue';
import { WsServer } from './api/ws';

// TODO if user can pick themes, it would essentially just change the src_path. audio init
// should be put in function to allow for reload in this case.
const SRC_PATH = `${process.env.PUBLIC_URL}/sounds/default`;
const EXT = 'mp3';

const AUDIO_PATHS = Object.entries(SoundByte).map(([soundByte, filename], _) => [
    soundByte,
    `${SRC_PATH}/${filename.toLocaleLowerCase()}.${EXT}`,
]);

const AUDIO_MAP = {};
for (const [action, path] of AUDIO_PATHS) {
    AUDIO_MAP[action] = new Howl({ src: [path] });
}

function AudioModule(props) {
    useEffect(() => {
        WsServer.subscribe('audio', onReceiveNewAudioState);
    }, []);

    const onReceiveNewAudioState = (soundByte: SoundByte) => {
        const audio = AUDIO_MAP[soundByte];
        if (audio) {
            audio.play();
        } else {
            console.log(`No audio file provided for ${soundByte}`);
        }
    };

    return null;
}

export function playTimerWarning() {
    AUDIO_MAP[SoundByte.TIMER_WARNING].play();
}

export default AudioModule;
