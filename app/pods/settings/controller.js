import Ember from 'ember';

export default Ember.Controller.extend({
  courseUrl: 'https://github.com/tunapanda/funzo-CSE-1000/archive/master.zip',
  currentUser: Ember.inject.service('currentUser')
});
