import http from "../../util/http";

const enpointUrl = 'http://cors.npmvs.com/registry.npmjs.com:443/';

export default async (packName) => {
  const url = enpointUrl + encodeURIComponent(packName);
  return http.memGetData(url);
};