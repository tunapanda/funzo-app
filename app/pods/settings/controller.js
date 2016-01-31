/* global TinCan */
import Ember from 'ember';

var tincan = new TinCan({
  recordStores: [{
    endpoint: 'http://lrs.tunapanda.org/data/xAPI/',
    username: '1017b67da772161ed2889d2a42f7c94780a5e21d',
    password: '1117ff2bb7674cf58b26177baed7b8f4e5e2e54d',
    allowFail: false
  }]
});

export default Ember.Controller.extend({
  tincan: tincan,

  courseUrl: 'https://github.com/tunapanda/funzo-CSE-1000/archive/master.zip',
  currentUser: Ember.inject.service('currentUser'),

  statementCount: Ember.computed.alias('model.statements.length'),

  unsyncedStatements: Ember.computed.filterBy('model.statements', 'synced', false),

  unsyncedStatementCount: Ember.computed.alias('unsyncedStatements.length'),

  syncable: Ember.computed.bool('unsyncedStatementCount'),

  actions: {
    syncStatements() {
      let statements = this.get('unsyncedStatements').map((statement) => statement.get('content'));

      this.get('tincan').sendStatements(statements, (res) => {
        if (!res[0].err) {
          let unsynced = this.get('unsyncedStatements');
          unsynced.setEach('synced', true);
          unsynced.invoke('save');
        }
      });
    },
    deleteAllCourse() {
      this.store.findAll('course').then((courses) => {
        courses.invoke('destroyRecord');
        this.store.findAll('module').then((modules) => modules.invoke('destroyRecord'));
      });
    },
    deleteAllStatements() {
      this.store.findAll('x-api-statement').then((statements) => statements.invoke('destroyRecord'));
    }
  }
});
