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
  
  expirationDate: Ember.computed('expiration', function() {
    let expiration = this.get('expiration');
    var expirationDate;
    if ( !expiration ) {
      expirationDate = false;
    } else {
      expiration = expiration.toString();
      expirationDate = new Date(
        expiration.slice(0,4), // YYYY
        expiration.slice(4,6), // MM
        expiration.slice(6,8)  // DD
      );
    }
    return expirationDate; 
  }),
  
  html: DS.attr(),

  key: Ember.computed('institution', 'expiration', function() {
    return this.get('institution') + this.get('expiration') + ENV.APP.encryptionKeyBase;
  }),

  paginated: DS.attr(),
  book: DS.belongsTo('book', { async: true })
});
