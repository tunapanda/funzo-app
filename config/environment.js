/* jshint node: true */
/* global TinCan */
var os     = require('os');
var ifaces = os.networkInterfaces();

var addresses = [];
for (var dev in ifaces) {
  ifaces[dev].forEach(function(details) {
    if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
      addresses.push(details.address);
    }
  });
}

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'funzo-app',
    podModulePrefix: 'funzo-app/pods',
    environment: environment,
    baseURL: '/',
    defaultLocationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      name: 'My Funzo App (OVERRIDE IN config/custom/default.js)',
      description: 'Made with Funzo (github.com/tunapanda/funzo-app)',
      logo: 'assets/funzologo.png',
      version: '0.0.1',
      author: {
        name: "OVERRIDE IN config/custom/default.js",
        email: "OVERRIDE IN config/custom/default.js",
        website: "OVERRIDE IN config/custom/default.js"
      },
      bookOnlyMode: true,
      defaultBook: false,
      // Set this to false to have no default
      defaultBook: {
        code: 'demo',
        hint: 'enter code "demo" to download an example book'
      },
      encryptionKeyBase: 'OVERRIDE IN config/custom/default.js',
      // For directories, be sure to include a trailing '/'!
      bookURLBase: 'OVERRIDE IN config/custom/default.js',
      xAPI: {
        recordStores: [{
          endpoint: 'OVERRIDE IN config/custom/default.js',
          username: 'OVERRIDE IN config/custom/default.js',
          password: 'OVERRIDE IN config/custom/default.js',
          allowFail: false
        }],
        // Number of decimal places to get from lat/long values
        // 3 decimal places = accuracy to ~ 100 meters
        // 2 would be closer to ~ 1km
        // More details: http://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude
        // -1 disables location data in xapi reports
        gps_accuracy: -1
      }
    },

    cordova: {
      rebuildOnChange: false,
      emulate: false,
      emberUrl: 'http://' + addresses[0] + ':4200',
      platform: 'android',
      liveReload: {
        enabled: false,
        platform: 'android'
      }
    },

    emberPouch: {
      localDb: 'funzo'
    },

    'ember-simple-auth': {
      authenticationRoute: 'login',
      routeAfterAuthentication: 'index'

    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV.apiUrl   = 'http://' + addresses[0] + ':3000/api/v1';
    ENV.development = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'auto';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'staging') {
    ENV.staging = true;
  }

  if (environment === 'production') {
    ENV.production = true;
  }

  [ 'default', environment ].forEach((fn) => {
    try {
      var override = require('./custom/'+fn+'.js');
      if (typeof(override) !== "undefined") {
        ENV.APP = override.update_config(ENV.APP);
      }
    } catch(e) {}
  });

  return ENV;
};
