import Ember from 'ember';

export default Ember.Component.extend({
  session: Ember.inject.service('session'),
  nav: Ember.inject.service('nav'),

  showBackButton: Ember.computed.alias('nav.showBackButton'),

  actions: {
    back() {
      this.sendAction('back');
    },
    logout() {
      this.get('session').invalidate();
    }
  },

  didInsertElement() {
    this.$('.dropdown-button').dropdown();
  }
});
