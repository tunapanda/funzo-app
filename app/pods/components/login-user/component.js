import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  classNames: ['collection-item', 'avatar'],
  classNameBindings: ['user.isSelected:active'],
  
  click() {
    this.sendAction('userSelected', this.get('user'));
  }
});
