import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['list-group', 'user-list'],
  tagName: 'ul',

  sortedUsers: Ember.computed.sort('users', 'sortBy'),
  
  sortBy: ['firstName'],
  
  _users: Ember.computed.map('sortedUsers', function(user) {
    return Ember.ObjectProxy.create({
      content: user,
      isSelected: false
    });
  }),
  
  actions: {
    userSelected(user) {
      this.get('_users').setEach('isSelected', false);
      user.set('isSelected', true);
      this.sendAction('userSelected', user);
    }
  }
});
