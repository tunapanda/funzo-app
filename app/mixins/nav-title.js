import Ember from 'ember';

export default Ember.Mixin.create({
  nav: Ember.inject.service('nav'),

  // activate() {
  //   this.set('nav.title', this.get('navBarTitle'));
  // },
  
  onNavBarTitle: Ember.observer('navBarTitle', function() {
    this.set('nav.title', this.get('navBarTitle'));
  }).on('init')
});
