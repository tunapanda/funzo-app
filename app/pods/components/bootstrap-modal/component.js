import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['modal', 'fade'],
  attributeBindings: ['role', 'tabindex'],
  classNameBindings: ['content.component'],
  role: 'dialog',
  tabindex: -1,
  args: {}
});
