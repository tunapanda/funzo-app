import Ember from 'ember';
import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  username: DS.attr(),
  // firstName: DS.attr(),
  // lastName: DS.attr(),
  // fullName: Ember.computed('firstName', 'lastName', function() {
  //   return this.get('firstName') + ' ' + this.get('lastName');
  // }),
  // pin: DS.attr(),
  isAuthenticated: DS.attr({ defaultValue: false }),
  isTeacher: DS.attr('boolean'),
  course: DS.hasMany('course'),
  module: DS.hasMany('module'),
  xAPIStatement: DS.hasMany('x-api-statement'),
	placeHolders: DS.attr()
});
