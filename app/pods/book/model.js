import Ember from 'ember';
import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  permalink: DS.attr(),
  title: DS.attr(),
  author: DS.attr(),
  institution: DS.attr(),
  institutionUri: DS.attr(),
  subject: DS.attr(),
  type: DS.attr({ defaultValue: 'tepup' }), // TEPUB - Tunapanda EPUB
  sections: DS.hasMany('section', { async: true }),
  cover: Ember.computed('id', function() {
    return window.cordova ? window.cordova.file.dataDirectory + 'content/books/' + this.get('id') + '/cover.png' : 'content/books/' + this.get('id') + '/cover.png';
  })
});
