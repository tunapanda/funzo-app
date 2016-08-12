/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var fs = require('fs');

function createIfNotExists(directory, callback) {
  fs.stat(directory, function(err) {
    // Check if error defined and the error code is "not exists"
    if (err && err.code === 'ENOENT') {
      // Create the directory, call the callback.
      fs.mkdir(directory, callback);
    } else {
      // just in case there was a different error:
      callback(err);
    }
    callback();
  });
}

// Create an index of books available at build-time
var booksDir = 'public/content/books';

createIfNotExists(booksDir, () => {
  var bookList = fs.readdirSync(booksDir).map(dir => {
    var bookDir = `${booksDir}/${dir}`;
    if (!fs.statSync(bookDir).isDirectory()) {
      // TODO: filter out nulls
      return;
    }
    // TODO: catch exceptions and filter out invalid JSON
    return JSON.parse(fs.readFileSync(bookDir + '/book.json'));
  }).filter(e => e);

  fs.writeFileSync(`${booksDir}/index.json`, JSON.stringify(bookList));
});

// Create an index of books available at build-time
var coursesDir = 'public/content/courses';

createIfNotExists(coursesDir, () => {
  var courseList = fs.readdirSync(coursesDir).map(dir => {
    var courseDir = `${coursesDir}/${dir}`;
    if (!fs.statSync(courseDir).isDirectory()) {
      // TODO: filter out nulls
      return;
    }
    // TODO: catch exceptions and filter out invalid JSON
    return JSON.parse(fs.readFileSync(courseDir + '/content.json'));
  }).filter(e => e);

  fs.writeFileSync(`${coursesDir}/index.json`, JSON.stringify(courseList));
});

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    minifyJS: {
      enabled: false
    },
    minifyCSS: {
      enabled: false
    },
    fingerprint: {
      exclude: ['content/courses', 'content/books']
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

  app.import('bower_components/velocity/velocity.js');
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
