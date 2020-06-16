import { useEffect } from 'react';
import { WsServer } from '../api/ws';
import { getEpochTimeMs } from '../shared/util/util';
import { EXPIRE_CLIENT_INTERVAL } from '../shared/util/consts';

const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
let hasInteracted = true;

function GameKeepAliveListener() {
    useEffect(() => {
        //add these events to the document.
        //register the activity function as the listener parameter.
        activityEvents.forEach((eventName) => {
            document.addEventListener(eventName, detectInteraction);
        });
        const interval = window.setInterval(checkInteraction, EXPIRE_CLIENT_INTERVAL);

        return () => window.clearInterval(interval);
    }, []);

    const checkInteraction = () => {
        // if no message had been sent over WS, but there has been use interaction, then send a keep alive
        // add 250 to offset from last keep alive
        if (getEpochTimeMs() - WsServer.timeLastSentMsg > EXPIRE_CLIENT_INTERVAL + 250 && hasInteracted) {
            WsServer.sendKeepAliveMessage();
        }
        if (hasInteracted) hasInteracted = false;
    };

    const detectInteraction = () => {
        if (!hasInteracted) hasInteracted = true;
    };

    return null;
}

export default GameKeepAliveListener;
