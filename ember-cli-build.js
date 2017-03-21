/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var fs = require('fs');
var libxml = require("libxmljs");
var env = require('./config/environment.js')();

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

// Update cordova version to match APP.version from config
var cordovaCfgXml = fs.readFileSync("cordova/TEMPLATE-config.xml");
var cordovaCfg = libxml.parseXml(cordovaCfgXml);
cordovaCfg.root().attr("version").value(env.APP.version);
cordovaCfg.get("/n:widget/n:name", { n:"http://www.w3.org/ns/widgets"} ).text(env.APP.name);
cordovaCfg.get("/n:widget/n:description", { n:"http://www.w3.org/ns/widgets"} ).text(env.APP.description);
var author = cordovaCfg.get("/n:widget/n:author", { n:"http://www.w3.org/ns/widgets"});
author.text(env.APP.author.name);
author.attr("email").value(env.APP.author.email);
author.attr("href").value(env.APP.author.website);
fs.writeFileSync("cordova/config.xml", cordovaCfg.toString());

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

  app.import('vendor/epub.js');
  // app.import('vendor/hooks.js');

  app.import('vendor/zip/zip.js');

  app.import('bower_components/video.js/dist/video.js');
  app.import('bower_components/video.js/dist/video-js.css');

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
