const {downloadsMonthlyAggregate} = require('./extractFns');

module.exports = {
  name: 'npms.collected.metadata.name',
  version: 'npms.collected.metadata.version',
  date: 'npms.collected.metadata.date',
  description: 'npms.collected.metadata.description',
  keywords: 'npms.collected.metadata.keywords',
  author: 'npms.collected.metadata.author',
  publisher: 'npms.collected.metadata.publisher',
  maintainers: 'npms.collected.metadata.maintainers',
  npmUrl: 'npms.collected.metadata.links.npm',
  homepageUrl: 'npms.collected.github.homepage',
  homepage2Url: 'npms.collected.metadata.links.homepage',
  repositoryUrl: 'npms.collected.metadata.links.repository',
  bugsUrl: 'npms.collected.metadata.links.bugs',
  starsCount: 'npms.collected.github.starsCount',
  forksCount: 'npms.collected.github.forksCount',
  subscribersCount: 'npms.collected.github.subscribersCount',
  dependentReposCount: 'libio_main.dependent_repos_count',
  totalIssuesCount: 'npms.collected.github.issues.count',
  issuesDistribution: 'npms.collected.github.issues.distribution',
  openIssuesCount: 'npms.collected.github.issues.openCount',
  license: 'npms.collected.metadata.license',
  dependentsCount: 'npms.collected.npm.dependentsCount',
  dependencies: 'npms.collected.metadata.dependencies',
  readme: 'npms.collected.metadata.readme',
  commits: 'npms.collected.github.commits',
  releasesForPeriod: [
    'npms.collected.metadata.releases',
    a => a.map(o => o.count),
  ],
  contributors: 'npms.collected.github.contributors',
  downloads: [
    'npm_downloads.downloads',
    downloadsMonthlyAggregate,
  ]
};