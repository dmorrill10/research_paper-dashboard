// Initializes the `paper` service on path `/paper`
const createService = require('./paper.class.js');
const hooks = require('./paper.hooks');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

function loadYmlFile(file_name) {
  return yaml.safeLoad(fs.readFileSync(file_name, 'utf8'));
}

function objectToSortedList(o, key) {
  var l = [];
  for (const k in o) {
    var c = Object.assign({}, o[k]);
    c[key] = k;
    l.push(c);
  }
  l.sort((a, b) => {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
    return 0
  });
  return l;
}

module.exports = function (app) {

  const paginate = app.get('paginate');

  const file = path.join(__dirname, '..', '..', '..', 'data', 'papers.yml');
  var papers = objectToSortedList(loadYmlFile(file), 'title');

  for (var paper of papers) {
    if ('references' in paper) {
      paper.references = objectToSortedList(paper.references, 'citation');
      for (const reference of paper.references) {
        for (var i = 0; i < papers.length; ++i) {
          const potentialLinkPaperTitle = papers[i].title;
          if (
            potentialLinkPaperTitle.toLowerCase() === reference.title.toLowerCase()
          ) {
            reference.link = i;
          }
        }
      }
    }
  }

  const options = {
    name: 'paper',
    data: papers,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/paper', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('paper');

  service.hooks(hooks);
};