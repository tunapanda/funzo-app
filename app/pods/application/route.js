import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import ENV from 'funzo-app/config/environment';

var setIfUnset = function(statement_data, setting, value) {
  if (typeof statement_data[setting] === "undefined") {
    statement_data[setting] = value;
  }
  return statement_data;
};

export default Ember.Route.extend(ApplicationRouteMixin, {
  session: Ember.inject.service('session'),
  nav: Ember.inject.service('nav'),
  bookManager: Ember.inject.service(),

  activate() {
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
    console.log("Sending xapi statement to " + ENV.APP.xAPI.recordStores[0].endpoint);
    console.log(statement);
    xApiStatements.addObject(statement);
    xapi.sendStatements(xApiStatements, (res) => {
      if (!res[0].err) {
        console.log("xAPI success!");
        // XXX FIXME since we're cheating and passing statement data directly,
        // we can't sync the corresponding db method for free. we'll have to
        // query the record here and set it to synced, or find a way to make
        // this work using actual model objects from a query
        // statement.synced = true;
        // statement.save();
        Ember.RSVP.resolve(xApiStatements);
      } else {
        console.log("xAPI error: " + res[0].err.toString());
      }
    });
  },

  /* extracted recordxAPI promises here */

  fetchUser(resolve, reject) { // jshint ignore:line
    var user = this.get('currentUser.model');
    resolve(user);
  },

  storeXAPIStatement(user, statement_data) {
    console.log("Storing xapi statement");
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
    if (typeof uri === "undefined") {
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
    if (typeof device !== "undefined") {
      platform = device.platform;
      platformVersion = device.version;
    }
    setIfUnset(statement_data.context.extensions[debugKey], "platform", platform);
    setIfUnset(statement_data.context.extensions[debugKey], "platformVersion", platformVersion);
    setIfUnset(statement_data.context.extensions[debugKey], "appVersion", ENV.APP.version);
    // We can use this to store non-fatal error messages for later review
    setIfUnset(statement_data.context.extensions[debugKey], "messages", []);
    var institutionKey = "http://tunapanda.org/xapi/extensions/institution";
    if (typeof statement_data.context.extensions[institutionKey] === "undefined") {
      var book = this.modelFor('book');
      statement_data.context.extensions[institutionKey] = book.get('institution');
    }
    return new Ember.RSVP.Promise((resolve,reject) => { // jshint ignore:line
      var gps_accuracy = ENV.APP.xAPI.gps_accuracy;
      if (typeof gps_accuracy === "undefined" || gps_accuracy < 0) {
        // location data disabled in config
        resolve(statement_data);
      }
      var gpsKey = "http://tunapanda.org/xapi/extensions/location";
      if (typeof statement_data.context.extensions[gpsKey] === "undefined") {
        navigator.geolocation.getCurrentPosition((location) => {
          if (typeof location  === "undefined") {
            resolve(statement_data);
          }
          setIfUnset(statement_data.context.extensions, gpsKey, {
            "lat": location.coords.latitude.toFixed(gps_accuracy),
            "lng": location.coords.longitude.toFixed(gps_accuracy)
          });
          resolve(statement_data);
        }, (err) => {
          statement_data.context.extensions[debugKey].messages.push("GPS error: " + err.toString());
          console.log("GPS (nonfatal) error: " + err.toString());
          // don't reject, just return the statement data sans location
          resolve(statement_data);
        });
      } else {
        console.log("GPS skipped");
        resolve(statement_data);
      }
    }, (err) => {
      console.log("Location ERROR:");
      console.log(err.toString());
    }).then((statement_data) => {
      if (typeof statement_data.actor === "undefined") {
        return new Ember.RSVP.Promise(
          this.fetchUser.bind(this)
        ).then((user) => {
          var useridKey =  "http://tunapanda.org/xapi/extensions/userid";
          setIfUnset(statement_data.context.extensions, useridKey, user.get('id'));
          var usernameKey =  "http://tunapanda.org/xapi/extensions/username";
          setIfUnset(statement_data.context.extensions, usernameKey, user.get('username'));
          setIfUnset(statement_data, "actor", {
            "objectType": "Agent",
            "account": {
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

    xAPIOpenBook() {
      console.log("xapi logging open book");
      var book = this.modelFor('book');
      var bookId = book.get('id');
      var bookTitle = book.get('title');
      var statement_data = {
        "description": "User opened book '" + bookTitle + "'",
        "verb": {
          "id": "http://adlnet.gov/expapi/verbs/launched",
          "display": {
              "en-US": "Opened the book"
          }
        },
        "object": {
          "id":  "http://funzo.tunapanda.org/xapi/object/book/" + bookId,
          "definition": {
            "name": {
              "en-US": bookTitle
            },
            "type": "http://funzo.tunapanda.org/xapi/activity/book"
          }
        }
      };
      this.recordxAPI(statement_data);
    },

    xAPIStartSection(section) {
      console.log("xapi logging section start");
      var sectionTitle = section.get('title');
      var permaLink = section.get('permalink');
      var statement_data = {
        "description": "User opened section '" + sectionTitle + "'",
        "verb": {
          "id": "http://adlnet.gov/expapi/verbs/started",
          "display": {
              "en-US": "Started the section"
          }
        },
        "object": {
          "id":  "http://funzo.tunapanda.org/xapi/object/section/" + permaLink,
          "definition": {
            "name": {
              "en-US": sectionTitle,
            },
            "type": "http://funzo.tunapanda.org/xapi/activity/book-section",
          },
        },
      };
      this.recordxAPI(statement_data);
    },

    xAPIOpenLink(event) {
      var linkText = event.target.textContent;
      console.log("xapi log link click: " + linkText);
      var statement_data = {
        "description": "User opened link '" + linkText + "'",
        "context": {
          "contextActivities": {
            "parent": event.target.baseURI
          }
        },
        "verb": {
          "id": "http://adlnet.gov/expapi/verbs/experienced",
          "display": {
              "en-US": "Clicked the link"
          }
        },
        "object": {
          "id":  event.target.href,
          "definition": {
            "name": {
              "en-US": linkText
            },
            "type": "http://funzo.tunapanda.org/xapi/activity/link"
          }
        }
      };
      this.recordxAPI(statement_data);
    }
  },

  sessionInvalidated() {
    this.transitionTo('login');
  }
});
