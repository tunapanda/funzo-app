import PouchDB from 'pouchdb';
import { Adapter } from 'ember-pouch';
import Ember from 'ember';

var db = new PouchDB('local_pouch');

export default Adapter.extend({
  db: db,
	modelNameFromPayloadKey(key) {
		if (key == "xApiStatements") {
			return "x-api-statement";
		} else {
			return key;
		}
	},
  query(store, type, queryObj) {
    return this.findAll(store, type, queryObj).then((results) => {
      console.log("DBG  query");
      console.log(results);
      let result = {};
      let keyForModel = Ember.String.pluralize(type.modelName);
			let filterFunction = (item) => {
        return Object.keys(queryObj).every((key) => item[key] === queryObj[key]);
      };
      
      result[keyForModel] = results[keyforModel].filter(filterFunction);
      return Ember.RSVP.resolve(result);
    });
  }
});
