/* global CryptoJS */
import DS from 'ember-data';
import Ember from 'ember';
import { Model } from 'ember-pouch';

export default Model.extend({
  title: DS.attr(),
  permalink: DS.attr(),
  content: DS.attr(),
  html: Ember.computed('content', function() {
    // let decrypted = CryptoJS.AES.decrypt(this.get('content'), 'averysecurekey');
    // return Ember.String.htmlSafe(decrypted);
    return Ember.String.htmlSafe(this.get('content'));
  }),
  book: DS.belongsTo('book', { async: true })
});
