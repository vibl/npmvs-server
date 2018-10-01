import http from "../../util/http";

export const numberOfMonths = 18;
const endpointUrl = 'https://api.npmjs.org/downloads/range/';
// const lastMonth = () => {
//   const today = new Date();
//   const thisMonth = today.getMonth();
//   const thisYear = today.getFullYear();
//   const this-day
// };
// const lastFullMonth = getLastFullMonth();
const params = '2017-03-01:2018-08-31/';

export default async (packName) => {
  const url = endpointUrl + params + encodeURIComponent(packName);
  return http.memGetData(url);
};