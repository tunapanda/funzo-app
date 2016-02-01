# Funzo-app

This is a preview of ember and H5P running as an app inside Phonegap/Cordova.

See [here](https://github.com/tunapanda/funzo-app/wiki/Development-Guide) for information on how to contribute.

Courses during development are added via bower E.G. `bower install tunapanda/funzo-CSE-1000 --save`.

Prefix any new courses with `funzo` to ensure they are added during the build process.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Git-LFS](https://github.com/github/git-lfs)
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
* `bower install git@github.com:tunapanda/funzo-CSE-1000 --save` the demo course (*be sure your github SSH key is loaded!*)

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
