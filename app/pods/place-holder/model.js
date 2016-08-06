import DS from 'ember-data';

export default DS.Model.extend({
	rev: DS.attr('string'),
  location: DS.attr('int'),
  user: DS.belongsTo('user'),
  book: DS.belongsTo('book')
});
