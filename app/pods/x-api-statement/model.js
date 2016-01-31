import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  content: DS.attr(),
  synced: DS.attr('boolean', { defaultValue: false }),
  user: DS.belongsTo('user')
});
