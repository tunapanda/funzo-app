import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  username: DS.attr(),
  isAuthenticated: DS.attr({ defaultValue: false }),
  isTeacher: DS.attr('boolean'),
  course: DS.hasMany('course'),
  module: DS.hasMany('module'),
  currentPage: DS.attr({ defaultValue: () => {} }),
  xApiStatements: DS.hasMany('x-api-statement')
});
