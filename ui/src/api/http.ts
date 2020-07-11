import axios from 'axios';
import { Config, getFrontEndEnvConfig } from '../shared/models/config/config';
import { EmailMessage } from '../shared/models/system/email';

const api = axios.create({
    baseURL: '', // for local dev currenly handled by proxy in package.json
});

const config: Config = getFrontEndEnvConfig();

// onSuccess = (response) => {}
// onError = (err) => {}
export const createGame = (data, onSuccess, onError) => {
    const url = '/api/createGame';
    return api.post(url, data).then(onSuccess).catch(onError);
};

export const getLedger = (gameInstanceUUID, onSuccess, onError) => {
    const url = `/api/ledger?gameInstanceUUID=${gameInstanceUUID}`;
    return api.get(url).then(onSuccess).catch(onError);
};

export function computeHandLogGETurl(gameInstanceUUID) {
    return `http${config.HTTPS ? 's' : ''}://${config.SERVER_URL}:${
        config.SERVER_PORT
    }/api/handlog?gameInstanceUUID=${gameInstanceUUID}`;
}

export const reportFrontEndError = (data, onSuccess, onError) => {
    const url = `/api/error`;
    return api.post(url, data).then(onSuccess).catch(onError);
};
export const sendMail = (message: EmailMessage, onSuccess, onError) => {
    const url = `/api/sendMail`;
    return api.post(url, message).then(onSuccess).catch(onError);
};
