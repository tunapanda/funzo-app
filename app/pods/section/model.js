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
  
  html: Ember.computed('content', function() {
    let encryption = this.get('encryption');
    let expiration = this.get('expirationDate');
    
    // This should be changed further down, so if the user
    // ever sees this default, something has indeed gone wrong. 
    let rendered = "<h1>Error</h1><p><em>Failed to extract book content. Please notify your school.</em></p>";
    console.log("Expiration = " + expiration);
    if (expiration && expiration < new Date()) {
      return Ember.String.htmlSafe("<h1>Expired</h1><p><em>Sorry, this copy of " +
        this.get('book.title') +
        " expired on " +
        expiration +
        ". Please notify your school.</em></p>");
    } else if (this.get('content') && encryption === 'aes') {
      let decrypted = CryptoJS.AES.decrypt(this.get('content'), this.get('key'));
      return Ember.String.htmlSafe(decrypted.toString(CryptoJS.enc.Utf8));
    } else {
      return Ember.String.htmlSafe(this.get('content'));
    }
  }),

  key: Ember.computed('institution', 'expiration', function() {
    return this.get('institution') + this.get('expiration') + ENV.APP.encryptionKeyBase;
  }),

  paginated: DS.attr(),
  book: DS.belongsTo('book', { async: true })
});
