import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend({
  // nav: Ember.inject.service('nav'),
  
  // didTransition() {
  //   this.set('nav.title', 'Course List');
  // },
  
  model() {
    return this.store.findAll('course');
  }
});
