/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var fs = require('fs');

// Create an index of books available at build-time
var booksDir = 'public/content/books';
var bookList = [];
bookList = fs.readdirSync(booksDir).map(d => {
  if (typeof(d) === "undefined") {
      return;
  }
  var bookDir = booksDir + '/' + d;
  if (!fs.statSync(bookDir).isDirectory()) {
    // TODO: filter out nulls
    return;
  }
  try {
      return JSON.parse(fs.readFileSync(bookDir + '/book.json'));
  } catch (e) {
    console.warn("ERROR handling " + d + ": " + e);
  }
}).filter(e => e);

fs.writeFileSync(booksDir + '/local_books.json', JSON.stringify(bookList));

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    minifyJS: {
      enabled: false
    },
    minifyCSS: {
      enabled: false
    },
    fingerprint: {
      exclude: ['courses']
    },
    jscsOptions: {
      enabled: true
    },
    sassOptions: {
      includePaths: [
        'bower_components/bootstrap-sass/assets/stylesheets',
        'bower_components/bootstrap-material-design/sass'
      ]
    }
  });

  // var course = new Funnel('bower_components', {
  //   include: ['funzo-*/**'],
  //   destDir: 'courses/'
  // });

  // var books = new Funnel('bower_components', {
  //   include: ['books/**'],
  //   destDir: ''
  // });

  // app.import('bower_components/materialize/dist/css/materialize.css');
  app.import('bower_components/tincan/build/tincan.js');

  // app.import('bower_components/Materialize/dist/js/materialize.js');
  app.import('bower_components/bootstrap/dist/js/bootstrap.js');
  app.import('bower_components/bootstrap-material-design/dist/js/material.js');
  app.import('bower_components/bootstrap-material-design/dist/js/ripples.js');

  app.import('bower_components/h5p-standalone/dist/js/h5p-standalone-main.js');

  app.import('vendor/aes.js');

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  // return app.toTree();
  return app.toTree();
  // return mergeTrees([app.toTree(), course]);
};
