import http from "../../util/http";
import store from '../store';

const endpointUrl = 'https://api.github.com/repos/';
const apiToken = '389dfd76a9f1d65d99cf38f8f7d12ed0e97f3066';

export default async (packName) => {
  const repoUrl = await store.detect(`rawdata.${packName}.repository_url`);
  const match = repoUrl.match(/github\.com\/([^/]+\/[^/.#]+)/);
  const presumedFullName = match ? match[1] : null;
  if( ! presumedFullName ) return {};
  const url = endpointUrl + presumedFullName;
  const data = await http.memGetData(url, {auth: {username: 'vibl', password: apiToken}});
  // TODO: get datapoints from data.
  const bla = data + ''; // debug
  return {repoFullName: data.full_name};
};