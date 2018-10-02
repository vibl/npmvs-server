const getPathsListBySource = mem( () => {
  let acc = {}, fullPath, path, source;
  const pathsList = values(flatten(specs)).filter(isString);
  for(fullPath of pathsList) {
    [source, path] = fullPath.match(/(\w+)\.(.+)$/).slice(1);
    if( ! acc[source] ) acc[source] = [];
    acc[source].push(path);
  }
  return acc;
});