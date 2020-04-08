import axios from "axios";

const api = axios.create({
  baseURL: "", // for local dev currenly handled by proxy in package.json
});

// onSuccess = (response) => {}
// onError = (err) => {}
export const createGame = (data, onSuccess, onError) => {
  const url = "/createGame";
  return api.post(url, data).then(onSuccess).catch(onError);
};
