/* global CryptoJS */
import DS from 'ember-data';
import Ember from 'ember';
import { Model } from 'ember-pouch';
import ENV from 'funzo-app/config/environment';

export default Model.extend({
  title: DS.attr(),
  permalink: DS.attr(),
  institution: DS.attr(),
  expiration: DS.attr(),

  content: DS.attr(),
  encryption: DS.attr({ defaultValue: 'aes' }),
  html: Ember.computed('content', function() {
    let encryption = this.get('encryption');
    if (typeof encryption === 'string') {
      encryption = encryption.toLowerCase();
    }
    if (this.get('content') && encryption === 'aes') {
      let decrypted = CryptoJS.AES.decrypt(this.get('content'), this.get('key'));
      return Ember.String.htmlSafe(decrypted.toString(CryptoJS.enc.Utf8));
    } else {
      return Ember.String.htmlSafe(this.get('content'));
    }
  }),

  key: Ember.computed('institution', 'expiration', function() {
    return this.get('institution') + this.get('expiration') + ENV.APP.encryptionKeyBase
  }),

  paginated: DS.attr(),
  book: DS.belongsTo('book', { async: true })
});
