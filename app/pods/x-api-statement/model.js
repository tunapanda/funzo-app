// import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  content: DS.attr(),
  user: DS.belongsTo('user')
});
