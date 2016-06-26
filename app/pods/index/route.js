import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(AuthenticatedRouteMixin, NavBarTitleMixin, {
  navBarTitle: 'My Library',
  showBackButton: false,
  showNavBar: true,
  
  model() {
    return Ember.RSVP.hash({
      courses: this.store.findAll('course'),
      books: this.store.findAll('book')
    });
  }
});
