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
    console.log("DBG syncing...");
    console.log("DBG syncStatements statements...");
    console.log(statement);
    var xApiStatements = [];
    console.log("DBG Adding...");
    xApiStatements.addObject(statement);
    console.log("DBG syncStatements xApiStatements...");
    console.log(xApiStatements);
    xapi.sendStatements(xApiStatements, (res) => {
      console.log("DBG sendStatements res");
      console.log(res);
      if (!res[0].err) {
        console.log("DBG no error");
        // XXX FIXME since we're cheating and passing statement data directly,
        // we can't sync the corresponding db method for free. we'll have to
        // query the record here and set it to synced, or find a way to make
        // this work using actual model objects from a query
        // statement.synced = true;
        // statement.save();
        Ember.RSVP.resolve(xApiStatements);
      } else {
        console.log("DBG ERROR");
        Ember.RSVP.reject(res);
      }
      //else { console.log("DBG: sync err..."); console.log(res[0].err); }
    });
  },

  /* extracted recordxAPI promises here */

  fetchUser(resolve, reject) {
    var user = this.get('currentUser.model');
    resolve(user);
  },

  storeXAPIStatement(user, statement_data) {
    if (typeof(statement_data.version) === "undefined") {
      statement_data.version = "1.0.0";
    }
    if (typeof(statement_data.actor) === "undefined") {
      statement_data.actor = {
        "objectType":"Agent",
        "account":{
          "id":   user.get('id'),
          "name": user.get('username'),
          "homePage": 'http://tunapanda.org'
        }
      };
    }
    this.store.createRecord('x-api-statement', {
      content: statement_data,
      user: user
    }).save();
    return statement_data;
  },

  /* end of extracted promises */

  recordxAPI(statement_data) {
    console.log("DBG recordxAPI");
    return new Ember.RSVP.Promise(
      this.fetchUser.bind(this)
    ).then((user) => {
      return this.storeXAPIStatement(user, statement_data);
    }).then(
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
      console.log("DBG OPENLINK");
      window.open(url, '_system');
    },

    sessionInvalidated() {
      this.transitionTo('login');
    },

    xAPIOpenLink(event) {
      console.log("DBG xAPIOpenLink");
      var statement_data = {
        "timestamp": new Date().toISOString(),
        "verb": {
            "id": "http://adlnet.gov/expapi/verbs/experienced",
            "display": {
                "en-US": "experienced"
            }
        },
        "object": {
            "id":  event.target.href
        },
        "context": {
            "platform": event.target.baseURI
        }
      };
      console.log("DBG recordxAPI start");
      this.recordxAPI(statement_data);
      console.log("DBG recordxAPI done");
    }
  },

  sessionInvalidated() {
    this.transitionTo('login');
  }
});
