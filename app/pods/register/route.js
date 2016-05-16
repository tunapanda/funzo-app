import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, UnauthenticatedRouteMixin, {
  session: Ember.inject.service('session'),
  store: Ember.inject.service('store'),

  showBackButton: true,

  navBarTitle: 'Register',

  model() {
    return this.store.createRecord('user');
  },

  actions: {
    willTransition() {
      if (this.controller.get('model.isNew')) {
        this.controller.get('model').deleteRecord();
      }
    }
  }
});
