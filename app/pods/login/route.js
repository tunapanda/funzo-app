import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, UnauthenticatedRouteMixin, {
  nav: Ember.inject.service(),

  navBarTitle: 'Welcome',

  model() {
    return this.store.createRecord('user');
  },

  activate() {
    this.set('showBackButton', false);
    this.set('nav.showIcons', false);
    this.set('nav.hide', true);
  },

  deactivate() {
    this.set('showBackButton', true);
    this.set('nav.showIcons', true);
    this.set('nav.hide', false);
  }
});
