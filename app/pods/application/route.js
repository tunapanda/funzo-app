import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import ENV from 'funzo-app/config/environment';

export default Ember.Route.extend(ApplicationRouteMixin, {
  session: Ember.inject.service('session'),
  nav: Ember.inject.service('nav'),
  bookManager: Ember.inject.service(),

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

  fetchUser(resolve, reject) {
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
      uri = "http://funzo.tunapanda.org/xapi/institution/" + book.get("institution");
    } 
    return uri;
  },

  populatexAPI(statement_data) {
    if (typeof(statement_data.version) === "undefined") {
      statement_data.version = "1.0.0";
    }
    if (typeof(statement_data.context) === "undefined") {
      statement_data.context = {};
    }
    if (typeof(statement_data.context.platform) === "undefined") {
      statement_data.context.platform = this.getXapiPlatform();
    }
    if (typeof(statement_data.context.contextActivities) === "undefined") {
      statement_data.context.contextActivities = {};
    }
    if (typeof(statement_data.actor) === "undefined") {
      return new Ember.RSVP.Promise(
        this.fetchUser.bind(this)
      ).then((user) => {
          statement_data.actor = {
            "objectType":"Agent",
            "account":{
              "id":   user.get('id'),
              "name": user.get('username'),
              "homePage": this.getXapiUserHomepage()
            }
          };
        return statement_data;
      });
    } else {
      return new Ember.RSVP.Promise(statement_data); 
    }
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

    xAPIOpenLink(event) {
      var linkText = event.target.textContent;
      var statement_data = {
        "timestamp": new Date().toISOString(),
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
