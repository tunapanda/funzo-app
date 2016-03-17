import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  title: DS.attr(),
  permalink: DS.attr(),
  module: DS.belongsTo('module')
});
