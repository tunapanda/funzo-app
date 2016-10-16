import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import ENV from 'funzo-app/config/environment';

var setIfUnset = function(statement_data, setting, value) {
  if (typeof(statement_data[setting]) === "undefined") {
    statement_data[setting] = value;
  }
  return statement_data;
};

export default Ember.Route.extend(ApplicationRouteMixin, {
  session: Ember.inject.service('session'),
  nav: Ember.inject.service('nav'),
  bookManager: Ember.inject.service(),

  activate() {
    console.log("XXX ROUTE ACTIVATE");
  },

  beforeModel() {
    if (window.cordova) {
      return new Ember.RSVP.Promise((res) => document.addEventListener('deviceready', res, false))
        .then(() => this.get('bookManager').setup())
        .then(() => this.get('bookManager').updateIndex()).then(this._super);
    }
    return this._super();
  },

  currentUser: Ember.inject.service('currentUser'),

  statementCount: Ember.computed.alias('model.statements.length'),
  unsyncedStatements: Ember.computed.filterBy('model.statements', 'synced', false),
  unsyncedStatementCount: Ember.computed.alias('unsyncedStatements.length'),
  syncable: Ember.computed.bool('unsyncedStatementCount'),

  // this used to be syncStatements(plural) so it has a useless array
  // we might want to go back to that, but for now one sync per statement
  // lets us get around our weird query issues
  syncStatement(statement) {
    /* global TinCan */
    var xapi = new TinCan(ENV.APP.xAPI);
    var xApiStatements = [];
    xApiStatements.addObject(statement);
    xapi.sendStatements(xApiStatements, (res) => {
      if (!res[0].err) {
        // XXX FIXME since we're cheating and passing statement data directly,
        // we can't sync the corresponding db method for free. we'll have to
        // query the record here and set it to synced, or find a way to make
        // this work using actual model objects from a query
        // statement.synced = true;
        // statement.save();
        Ember.RSVP.resolve(xApiStatements);
      } else {
        console.log("DBG ERROR");
      }
    });
  },

  /* extracted recordxAPI promises here */

  fetchUser(resolve, reject) { // jshint ignore:line
    var user = this.get('currentUser.model');
    resolve(user);
  },

  storeXAPIStatement(user, statement_data) {
    this.store.createRecord('x-api-statement', {
      content: statement_data,
      user: user
    }).save();
    return statement_data;
  },

  /* end of extracted promises */

  getXapiPlatform() {
    return this.modelFor('book').get('id');
  },

  getXapiUserHomepage() {
    var book = this.modelFor('book');
    var uri = book.get('institutionUri');
    if (typeof(uri) === "undefined") {
      uri = "http://funzo.tunapanda.org/xapi/extensions/institution/" + book.get("institution");
    } 
    return uri;
  },

  populatexAPI(statement_data) {
    setIfUnset(statement_data, "timestamp", new Date().toISOString());
    setIfUnset(statement_data, "version", "1.0.0");
    setIfUnset(statement_data, "context", {});
    setIfUnset(statement_data.context, "platform", this.getXapiPlatform());
    setIfUnset(statement_data.context, "extensions", {});
    var debugKey = "http://tunapanda.org/xapi/extensions/debug";
    setIfUnset(statement_data.context.extensions, debugKey, {});
    setIfUnset(statement_data.context.extensions[debugKey], "book", this.modelFor('book').get('id'));
    setIfUnset(statement_data.context.extensions[debugKey], "userAgent", navigator.userAgent);
    var platform = "web";
    var platformVersion = "unknown";
    /* global device */
    if (typeof(device) !== "undefined") {
      platform = device.platform;
      platformVersion = device.version;
    }
    setIfUnset(statement_data.context.extensions[debugKey], "platform", platform);
    setIfUnset(statement_data.context.extensions[debugKey], "platformVersion", platformVersion);
    setIfUnset(statement_data.context.extensions[debugKey], "appVersion", ENV.APP.version);
    // We can use this to store non-fatal error messages for later review
    setIfUnset(statement_data.context.extensions[debugKey], "messages", []);
    var institutionKey = "http://tunapanda.org/xapi/extensions/institution";
    if (typeof(statement_data.context.extensions[institutionKey]) === "undefined") {
      var book = this.modelFor('book');
      statement_data.context.extensions[institutionKey] = book.get('institution');
    }
    return new Ember.RSVP.Promise((resolve,reject) => { // jshint ignore:line
      var gps_accuracy = ENV.APP.xAPI.gps_accuracy;
      if ( typeof(gps_accuracy) === "undefined" || gps_accuracy < 0 ) {
        // location data disabled in config
        resolve(statement_data);
      }
      var gpsKey = "http://tunapanda.org/xapi/extensions/location";
      if (typeof(statement_data.context.extensions[gpsKey]) === "undefined") {
        navigator.geolocation.getCurrentPosition((location) => {
          if (typeof(location) === "undefined") {
            resolve(statement_data);
          }
          setIfUnset(statement_data.context.extensions, gpsKey, {
            "lat": location.coords.latitude.toFixed(gps_accuracy),
            "lng": location.coords.longitude.toFixed(gps_accuracy),
          });
          resolve(statement_data);
        }, (err) => {
          statement_data.context.extensions[debugKey].messages.push("GPS error: " + err);
        }); 
      } else {
        resolve(statement_data);
      }
    }, (err) => { console.log("Location ERROR:"); console.log(err) ;}
    ).then((statement_data) => {
      if (typeof(statement_data.actor) === "undefined") {
        return new Ember.RSVP.Promise(
          this.fetchUser.bind(this)
        ).then((user) => {
          var useridKey =  "http://tunapanda.org/xapi/extensions/userid";
          setIfUnset(statement_data.context.extensions, useridKey, user.get('id'));
          var regnameKey =  "http://tunapanda.org/xapi/extensions/regname";
          setIfUnset(statement_data.context.extensions, regnameKey, user.get('username'));
          setIfUnset(statement_data, "actor", {
            "objectType":"Agent",
            "account":{
              "name":   user.get('username'),
              "homePage": this.getXapiUserHomepage()
            }
          });
          return statement_data;
        });
      } else {
        return statement_data; 
      }
    });
  },

  recordxAPI(statement_data) {
    return this.populatexAPI(statement_data).then(
      this.syncStatement.bind(this)
    );
  },

  actions: {
    back() {
      if (this.get('nav.indexOnly')) {
        return this.transitionTo('index', this.modelFor('index'));
      }
      history.back();
    },

    openLink(url) {
      window.open(url, '_system');
    },

    sessionInvalidated() {
      this.transitionTo('login');
    },

    xAPIOpenBook(book) {
      console.log("XXX ACTIVATE START");
      var bookId = book.get('id');
      var bookTitle = book.get('title');
      var statement_data = {
        "description": "User opened book '" + bookTitle + "'",
        "verb": {
          "id": "http://adlnet.gov/expapi/verbs/launched",
          "display": {
              "en-US": "launched"
          }
        },
        "object": {
          "id":  bookId,
          "definition": {
            "name": {
              "en-US": bookTitle,
            },
            "type": "http://funzo.tunapanda.org/xapi/activity/book",
          },
        },
      };
      this.recordxAPI(statement_data);
      console.log("XXX ACTIVATE END");
    },

    xAPIOpenLink(event) {
      var linkText = event.target.textContent;
      var statement_data = {
        "description": "User opened link '"+linkText+"'",
        "context": { 
          "contextActivities": {
            "parent": event.target.baseURI
          }
        },  
        "verb": {
          "id": "http://adlnet.gov/expapi/verbs/experienced",
          "display": {
              "en-US": "experienced"
          }
        },
        "object": {
          "id":  event.target.href,
          "definition": {
            "name": {
              "en-US": linkText,
            },
            "type": "http://funzo.tunapanda.org/xapi/activity/link",
          },
        },
      };
      this.recordxAPI(statement_data);
    }
  },

  sessionInvalidated() {
    this.transitionTo('login');
  }
});
