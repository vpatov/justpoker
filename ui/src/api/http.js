import axios from 'axios';

const api = axios.create({
    baseURL: '', // for local dev currenly handled by proxy in package.json
});

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

export const reportFrontEndError = (data, onSuccess, onError) => {
    const url = `/api/error`;
    return api.post(url, data).then(onSuccess).catch(onError);
};
