/* global CryptoJS */
import DS from 'ember-data';
import Ember from 'ember';
import { Model } from 'ember-pouch';

export default Model.extend({
  title: DS.attr(),
  permalink: DS.attr(),
  content: DS.attr(),
  encryption: DS.attr({defaultValue:"aes"}),
  html: Ember.computed('content', function() {
    let encryption = this.get('encryption');
    if (typeof(encryption) === "string") {
    	encryption = encryption.toLowerCase();
    }
    if (this.get('content') && encryption === "aes") {
		let decrypted = CryptoJS.AES.decrypt(this.get('content'), 'averysecurekey');
		return Ember.String.htmlSafe(decrypted.toString(CryptoJS.enc.Utf8));
	} else {
		return Ember.String.htmlSafe(this.get('content'));
	}
  }),
  paginated: DS.attr(),
  book: DS.belongsTo('book', { async: true })
});
