import Ember from 'ember';

export default Ember.Component.extend({
  tagName: Ember.computed('editable', function() {
    return this.get('editable') ? 'div' : 'a';
  }),
  classNames: ['collection-item', 'avatar'],
  classNameBindings: ['user.isSelected:active'],
  
  canDelete: Ember.computed('editable', 'user.isAuthenticated', function() {
    return this.get('editable') && !this.get('user.isAuthenticated');
  }),
  
  click() {
    if(this.get('editable')) {
      this.sendAction('userSelected', this.get('user'));
    }
  },
  
  actions: {
    delete() {
      this.get('user.content').destroyRecord();
    }
  }
});
