/* global CryptoJS */
import DS from 'ember-data';
import Ember from 'ember';
import { Model } from 'ember-pouch';
import ENV from 'funzo-app/config/environment';

const ENC_NONE = 0;
const ENC_AESv2 = 10;
const ENC_DEFAULT = ENC_AESv2;

function getEncryptionKey() {
  return  ENV.vendor.encryptionKeyBase;
}

function getDownloadUrl(bookId) {
  return ENV.vendor.downloadUrlBase;
}

export default Model.extend({
  title: DS.attr(),
  permalink: DS.attr(),
  expiration: DS.attr(),
  content: DS.attr(),
  institution: DS.attr(),
  encryptionMode: DS.attr({ defaultValue: ENC_DEFAULT }),
  html: Ember.computed('content', function() {
    console.log("Getting model for " + this.get('title'));
    var content = this.get('content');
    let expirationRaw = this.get('expiration');
    if (typeof(expirationRaw) === "undefined") {
      var expiration = false;
    } else {
      var expiration = new Date(
        expirationRaw.slice(0,4),
        expirationRaw.slice(4,6),
        expirationRaw.slice(6,8)
      );
    }
    // This should be changed further down, so if the user
    // ever sees this default, something has indeed gone wrong. 
    let rendered = "<h1>Error</h1><p><em>Failed to extract book content. Please notify your school.</em></p>";
    if (expiration && expiration > new Date()) {
      rendered = "<h1>Expired</h1><p><em>Sorry, this copy of " 
        + this.get('book.title')
        + " expired on "
        + expiration
        + ". Please notify your school.</em></p>";
    } else {
      let encryptionMode = this.get('encryptionMode');
      switch(encryptionMode) {
       case ENC_NONE:
         rendered = this.get('content');
         break;
       default: // ENC_AESv2
         let encryptionKey = 
          this.get('institution') +
          this.get('expiration') + 
          ENV.vendor.encryptionKeyBase;
          
         rendered = CryptoJS.AES
            .decrypt(rendered,encryptionKey)
            .toString(CryptoJS.enc.Utf8);
      }
    }
    return Ember.String.htmlSafe(rendered);
  }),
  paginated: DS.attr(),
  book: DS.belongsTo('book', { async: true })
});
