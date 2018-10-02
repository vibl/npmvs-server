const {getDotpathTreeFromDotpathList, indexValuesByDotpath} = require('./vibl-fp');

const indexTree =
  {
    a: {
      leaf: true,
      path: 'a',
      branch: {
        b: {
          leaf: false,
          path: 'a.b',
          branch: {
            c: {
              leaf: true,
              path: 'a.b.c',
              branch: null,
            }
          }
        }
      }
    },
    d: {
      leaf: false,
      path: 'd',
      branch: {
        e: {
          leaf: true,
          path: 'd.e',
          branch: null,
        },
        f: {
          leaf: true,
          path: 'd.f',
          branch: null,
        }
      }
    }
  };
const path = 'a.b.c';
const branch = {
  a: {
    leaf: false,
    path: 'a',
    branch: {
      b: {
        leaf: false,
        path: 'a.b',
        branch: {
          c: {
            leaf: true,
            path: 'a.b.c',
            branch: null,
          }
        }
      }
    }
  }
};
const dotpathList =
  [
    'a',
    'a.b.c',
    'd.e',
    'd.f',
  ];
const obj = {
  a: {
    b: {
      c: 1,
    }
  },
  d: {
    e: 2,
    f: 3,
  }
};
const indexedObj = {
  'a' : {
    b: {
      c: 1,
    }
  },
  'a.b.c': 1,
  'd.e': 2,
  'd.f': 3,

};
test('getIndexTree', () => {
  expect(getDotpathTreeFromDotpathList(dotpathList)).toEqual(indexTree);
});
test('indexValuesByDotpath', () => {
  expect(indexValuesByDotpath(indexTree, obj)).toEqual(indexedObj);
});

