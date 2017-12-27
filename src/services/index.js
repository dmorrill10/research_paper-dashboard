const paper = require('./paper/paper.service.js');
module.exports = function (app) {
  app.configure(paper);
};