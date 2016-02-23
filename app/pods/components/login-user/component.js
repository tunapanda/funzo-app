import Ember from 'ember';

export default Ember.Component.extend({
  currentUser: Ember.inject.service('currentUser'),
  session: Ember.inject.service('session'),
  
  editable: false,
  
  classNames: ['list-group-item'],
  classNameBindings: ['user.isSelected:active'],
  
  canDelete: Ember.computed('editable', 'user.isAuthenticated', function() {
    return this.get('session.isAuthenticated') && this.get('editable') && (this.get('user.id') !== this.get('currentUser.model.id'));
  }),
  
  click() {
    if (!this.get('editable')) {
      this.sendAction('userSelected', this.get('user'));
    }
  },
  
  actions: {
    delete() {
      this.get('user.content').destroyRecord();
    }
  }
});
