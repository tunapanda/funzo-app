import Ember from 'ember';

export default Ember.Mixin.create({
  nav: Ember.inject.service('nav'),
  _showBackButton: Ember.computed.alias('nav.showBackButton'),
  // activate() {
  //   this.set('nav.title', this.get('navBarTitle'));
  // },

  afterModel() {
    this.set('_showBackButton', this.get('showBackButton'));
    this.set('nav.title', this.get('navBarTitle'));
  }
});
