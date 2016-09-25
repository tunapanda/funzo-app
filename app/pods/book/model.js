import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  title: DS.attr(),
  author: DS.attr(),
  institutionUri: DS.attr(),
  subject: DS.attr(),
  sections: DS.hasMany('section', { async: true }),
  cover: Ember.computed('id', function() {
    return window.cordova ? window.cordova.file.dataDirectory + 'content/books/' + this.get('id') + '/cover.png' : 'content/books/' + this.get('id') + '/cover.png';
  })
});
