import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'nav',
  classNames: ['navbar', 'navbar-fixed-top'],
  
  session: Ember.inject.service('session'),
  nav: Ember.inject.service('nav'),

  classNameBindings: ['hide'],

  showBackButton: Ember.computed.alias('nav.showBackButton'),
  hide: Ember.computed.alias('nav.hide'),
  showIcons: Ember.computed.alias('nav.showIcons'),
  
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
    Ember.$.material.ripples();
  }
});
