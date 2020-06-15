import { useEffect } from 'react';
import { Howl, Howler } from 'howler';
import { SoundByte } from '../shared/models/state/audioQueue';
import { WsServer } from '../api/ws';

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
    if (action !== SoundByte.NONE) AUDIO_MAP[action] = new Howl({ src: [path] });
}

function AudioModule(props) {
    const { mute } = props;

    useEffect(() => {
        WsServer.subscribe('audio', onReceiveNewAudioState);
    }, []);

    useEffect(() => {
        Howler.mute(mute);
    }, [mute]);

    const onReceiveNewAudioState = (soundByte: SoundByte) => {
        const audio = AUDIO_MAP[soundByte];
        if (audio) {
            audio.play();
        }
    };

    return null;
}

export function playTimerWarning() {
    AUDIO_MAP[SoundByte.TIMER_WARNING].play();
}

export default AudioModule;
