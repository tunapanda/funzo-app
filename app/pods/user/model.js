import DS from 'ember-data';

export default DS.Model.extend({
  course: DS.attr(),
  module: DS.attr(),
  lesson: DS.attr(),
  xAPIStatement: DS.attr()
});
