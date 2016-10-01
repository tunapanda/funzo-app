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
      let keyForModel = Ember.String.pluralize(type.modelName);
      // FIXME: This is a terrible hack to work around I don't even
      // know what with Ember.
      if (keyForModel === "x-api-statements") {
        keyForModel = "xApiStatements";
      }
      let filterFunction = (item) => {
        return Object.keys(queryObj).every((key) => item[key] === queryObj[key]);
      };

      result[keyForModel] = results[keyForModel].filter(filterFunction);

    console.log("DBG Query returning...");
    console.log(result);
    return Ember.RSVP.resolve(result);
  });
  }
});
