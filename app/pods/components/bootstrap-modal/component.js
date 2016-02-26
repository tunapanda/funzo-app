import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['modal', 'fade', 'add-course-modal'],
  attributeBindings: ['role', 'tabindex'],
  role: 'dialog',
  tabindex: -1
});
