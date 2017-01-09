/* global CryptoJS */
import Ember from 'ember';

export default Ember.Service.extend({
  decryptSection(section) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      // delay by 100ms to give time to transition to the loading spinner
      Ember.run.later(() => {
        let encryption = section.get('encryption');
        let expiration = section.get('expirationDate');

        // console.log("Expiration = " + expiration);
        if (expiration && expiration < new Date()) {
          section.set('html', Ember.String.htmlSafe(`<h1>Expired</h1><p><em>Sorry, this copy of ${section.get('book.title')} expired on ${expiration}. Please notify your school.</em></p>`));
        } else if (section.get('content') && encryption === 'aes') {
          let decrypted;
          try {
            decrypted = CryptoJS.AES.decrypt(section.get('content'), section.get('key')).toString(CryptoJS.enc.Utf8);
          } catch (e) {
            return reject(e);
          }
          section.set('html', Ember.String.htmlSafe(decrypted));
        } else {
          section.set('html', Ember.String.htmlSafe(section.get('content')));
        }
        resolve(section);
      }, 100); // increase to simulate slow decrytion on desktop
    });
  }
});
