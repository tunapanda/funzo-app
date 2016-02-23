import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Ember.Route.extend(UnauthenticatedRouteMixin, {
  model() {
    return this.store.findAll('user');
  },
  
  actions: {
    userSelected(model) {
      this.trigger('userSelected', model);
      this.transitionTo('login.pin', model);
    }
  }
});
