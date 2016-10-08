import DS from 'ember-data';
import Ember from 'ember';
import { Model } from 'ember-pouch';

export default Model.extend({
  title: DS.attr(),
  permalink: DS.attr(),
  section: DS.attr(),
  module: DS.belongsTo('module'),
  type: DS.attr(),
  isReading: Ember.computed.equal('type', 'reading')
});
