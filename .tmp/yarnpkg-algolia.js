// TODO https://github.com/yarnpkg/website/tree/250690e92df9381ec1a91722bc16f758030db471/js/src/lib/Search
// TODO https://ofcncog2cu-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%20(lite)%203.27.1%3Breact-instantsearch%205.2.0-beta.2%3BJS%20Helper%202.26.1&x-algolia-application-id=OFCNCOG2CU&x-algolia-api-key=f54e21fa3a2a0160595bb058179bfb1e

const body = {
  "requests": [{
    "indexName": "npm-search",
    "params": "query=r&hitsPerPage=5&maxValuesPerFacet=10&page=0&attributesToRetrieve=%5B%22deprecated%22%2C%22description%22%2C%22downloadsLast30Days%22%2C%22repository%22%2C%22homepage%22%2C%22humanDownloadsLast30Days%22%2C%22keywords%22%2C%22license%22%2C%22modified%22%2C%22name%22%2C%22owner%22%2C%22version%22%5D&attributesToHighlight=%5B%22name%22%2C%22description%22%2C%22keywords%22%5D&highlightPreTag=%3Cais-highlight-0000000000%3E&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&facets=%5B%22keywords%22%2C%22keywords%22%2C%22owner.name%22%5D&tagFilters="
  }]
}