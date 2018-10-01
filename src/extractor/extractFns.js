import {omit, values} from 'ramda';

const periodsDaysAgo = [
  90,
  180,
  365,
  730,
  Infinity
];
export const extractReleasesCount = ({value :releases}) => {
  const now = Date.now();
  let releasesDaysAgo = values(omit(['modified', 'created'], releases)).map( date => (now - new Date(date)) / 1000 / 3600 / 24 );
  releasesDaysAgo.sort((a, b) => a - b);
  let
    acc = [0],
    period = 0;

  for(let releaseDaysAgo of releasesDaysAgo) {
     if( releaseDaysAgo > periodsDaysAgo[period] ) {
       period++;
       acc[period] = acc[period - 1];
     }
     acc[period]++;
   }
   return acc;
};