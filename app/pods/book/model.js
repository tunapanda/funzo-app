import DS from 'ember-data';
import { Model } from 'ember-pouch';

var currentUser = Ember.inject.service('currentUser');
export default Model.extend({
  title: DS.attr(),
  author: DS.attr(),
  subject: DS.attr(),
  sections: DS.hasMany('section', { async: true }),
  cover: Ember.computed('id', function() {
    return window.cordova ? window.cordova.file.dataDirectory + 'content/books/' + this.get('id') + '/cover.png' : 'content/books/' + this.get('id') + '/cover.png';
  }),
	placeHolders: DS.attr(),
	placeHolder: Ember.computed('placeHolders', {
		get(key) {
			var placeHolders = this.get('placeHolders')
			if (typeof(placeHolders[currentUser.model.id]) === "undefined") {
				placeHolders[curentuser.model.id] = 0;
				console.log("Getting new placeHolder " + placeHolders[currentUser.model.id]);
			} else {
				console.log("Getting existing placeHolder " + placeHolders[currentUser.model.id]);
			return placeHolders[currentUser.model.id];
			}
		},
		set(key,value) {
			var placeHolders = this.get('placeHolders')
			if (typeof(placeHolders[currentUser.model.id]) === "undefined") {
				placeHolders[curentuser.model.id] = value;
				console.log("Setting new placeHolder " + placeHolders[currentUser.model.id]);
			} else {
				let origVal = placeHolders[currentUser.model.id];
				placeHolders[curentuser.model.id] = value;
				console.log("Changing existing placeHolder from " + origVal + " to " + placeHolders[currentUser.model.id]);
			}
			return placeHolders[currentUser.model.id]
		}
	})
});
