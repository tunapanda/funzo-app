import DS from 'ember-data';
import Ember from 'ember';
import { Model } from 'ember-pouch';

export default Model.extend({
  title: DS.attr(),
  permalink: DS.attr(),
  content: DS.attr(),
  html: Ember.computed('content', function() {
    return Ember.String.htmlSafe(this.get('content'));
  }),
  book: DS.belongsTo('book', { async: true })
});
