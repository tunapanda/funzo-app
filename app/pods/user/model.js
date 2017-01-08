import Ember from 'ember';
import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  username: DS.attr(),
  isAuthenticated: DS.attr({ defaultValue: false }),
  isTeacher: DS.attr('boolean'),
  course: DS.hasMany('course'),
  module: DS.hasMany('module'),
  currentPage: DS.attr({ defaultValue: () => new Ember.Object() }),
  xApiStatements: DS.hasMany('x-api-statement')
});
