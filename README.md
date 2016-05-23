# Funzo-app 0.2.0

[![Build Status](https://travis-ci.org/tunapanda/funzo-app.svg?branch=master)](https://travis-ci.org/tunapanda/funzo-app) [![Join the chat at https://gitter.im/tunapanda/funzo-app](https://badges.gitter.im/tunapanda/funzo-app.svg)](https://gitter.im/tunapanda/funzo-app?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is a preview of ember and H5P running as an app inside Phonegap/Cordova.

See [here](https://github.com/tunapanda/funzo-app/wiki/Development-Guide) for information on how to contribute.

Courses during development are copied to `public/content/courses`, see https://https://github.com/tunapanda/funzo-CSE-1000 for an example course.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)
* [Cordova](https://cordova.apache.org)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

Generate the APKs, these can only be used for development not distribution because they are unsigned

* `ember cordova:build --platform=android` (development)
* `ember cordova:build --platform=android --environment production` (production)

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
