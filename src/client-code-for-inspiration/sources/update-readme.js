import http from "../util/http";
import store from "./store";

const updateReadme = async (data, packName) => {
  const readmeUrl = data.collected.metadata.links.repository
    .replace(/https?:\/\/github.com\/([^/]+\/[^/]+).*/, 'https://raw.githubusercontent.com/$1/master/README.md');
  const readme = await http.memGet(readmeUrl);
  if( readme.data ) {
    store.set({data:{InfoPages:{[packName]: {
            readme: readme.data,
            readmeUpdated: new Date(),
          }}}});
  }
}
export default updateReadme;