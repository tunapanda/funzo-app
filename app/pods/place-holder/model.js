import DS from 'ember-data';

export default DS.Model.extend({
  location: DS.attr('int'),
  user: DS.belongsTo('user'),
  book: DS.belongsTo('book')
});
