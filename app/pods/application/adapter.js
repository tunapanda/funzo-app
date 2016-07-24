import PouchDB from 'pouchdb';
import { Adapter } from 'ember-pouch';
import Ember from 'ember';

var db = new PouchDB('local_pouch');

export default Adapter.extend({
  db: db,
  query(store, type, queryObj) {
    return this.findAll(store, type, queryObj).then((results) => {
      console.log("DBG  query");
      console.log(results);
      let result = {};
      result[type.modelName + 's'] = results[type.modelName + 's'].filter((item) => Object.keys(queryObj).every((key) => item[key] === queryObj[key]) ? true : false);
      return Ember.RSVP.resolve(results);
    });
  }
});