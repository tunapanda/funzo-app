import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  title: DS.attr('text'),
  id: DS.attr('number'),
  book: DS.belongsTo('book', { async: true })
});
