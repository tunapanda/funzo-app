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
  
  syncStatements() {
    var xapi = new TinCan(ENV.APP.xAPI);
    console.log("DBG syncing...");
    this.store.query(
      'x-api-statement',
      {'synced':false}
    ).then(statements => {
      xapi.sendStatements(statements, (res) => {
        if (!res[0].err) {
          statements.setEach('synced', true);
          statements.invoke('save');
        }
      });    
    });
  },
  
  recordxAPI(statement_data) {
    console.log("DBG recordxAPI");
    return new Ember.RSVP.Promise((resolve,reject) => {
      /* TODO: it's wasteful to fetch user data now, since we
               might not use it (see the second `if` below),
               but I don't see another way to ensure that
               `statement.save()` doesn't get called before
               the promise resolves, in case we do need it.
               Maybe there's a better way though?          */
      var user = this.get('currentUser.model');
      resolve(user);
    }).then((user) => {
      if (typeof(statement_data.version) === "undefined") {
        statement_data.version = "1.0.0";
      }
      if (typeof(statement_data.actor) === "undefined") {
        statement_data.actor = {
          "objectType":"Agent", 
          "account":{
            "id":   user.get('id'),
            "name": user.get('fullName'),
            "homePage": 'http://tunapanda.org'
          }
        };
      }
      let statement = this.store.createRecord('x-api-statement', { 
          content: statement_data, 
          user: this.get('currentUser.model') 
      });
      return statement;
   }).then((statement) => {
    console.log("DBG pre saving..."); 
    statement.save();
    console.log("DBG post saving..."); 
   
    console.log("DBG pre syncing"); 
    this.syncStatements();
    console.log("DBG post syncing"); 
   
   });
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
      this.recordxAPI(statement_data);
    }
  },

  sessionInvalidated() {
    this.transitionTo('login');
  }
});
