const {extractReleasesCount} = require('./extractFns');

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
  homepage: 'npms.collected.github.homepage',
  homepage2: 'npms.collected.metadata.links.homepage',
  repository: 'npms.collected.metadata.links.repository',
  links: 'npms.collected.metadata.links.npm',
  bugs: 'npms.collected.metadata.links.bugs',
  starsCount: 'npms.collected.github.starsCount',
  forksCount: 'npms.collected.github.forksCount',
  subscribersCount: 'npms.collected.github.subscribersCount',
  dependentReposCount: 'libio_main.dependent_repos_count',
  totalIssuesCount: 'npms.collected.github.issues.count',
  issuesDistribution: 'npms.collected.github.issues.distribution',
  openIssuesCount: 'npms.collected.github.issues.openCount',
  license: 'npms.collected.metadata',
  dependencies: 'npms.collected.dependencies',
  readme: 'npms.collected.metadata.readme',
  releasesForPeriod: [
    'npms.collected.metadata.releases',
    extractReleasesCount,
  ],
};