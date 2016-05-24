import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, UnauthenticatedRouteMixin, {
  showBackButton: true,
  navBarTitle: 'Login > PIN',
  activate() {
    this.set('showBackButton', true);
  }
});
