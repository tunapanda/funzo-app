/* jshint node: true */
/* global TinCan */
var os     = require('os');
var ifaces = os.networkInterfaces();
try {
  var local  = require('./local.js');
} catch(e) {
  var local  = { 
    update_env: function(env) {
      env.test = "OTHER";
      return env;
    }
  }
}

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
    test: "testfoo",
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
      bookOnlyMode: true,
      // Set this to false to have no default
      defaultBook: {
        code: 'demo',
        hint: 'enter code "demo" to download an example book'
      },
      encryptionKeyBase: 'foobarbaz',
      // For directories, be sure to include a trailing '/'!
      bookURLBase: 'http://funzo.tunapanda.org/content/dl/',
      xAPI: {
        recordStores: [{
          endpoint: 'http://lrs.tunapanda.org/data/xAPI/',
          username: '1017b67da772161ed2889d2a42f7c94780a5e21d',
          password: '1117ff2bb7674cf58b26177baed7b8f4e5e2e54d',
          allowFail: false
        }]
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
    ENV.apiUrl = 'http://funzo-app-staging.herokuapp.com/api/v1';
    ENV.staging = true;
  }

  if (environment === 'production') {
    ENV.apiUrl = 'http://funzo-app.herokuapp.com/api/v1';
    ENV.production = true;
  }

  return local.env(ENV);
};
