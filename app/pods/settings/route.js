import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
  navBarTitle: 'Settings',

  model() {
    return Ember.RSVP.hash({
      users: this.store.findAll('user'),
      statements: this.store.findAll('x-api-statement')
    });
  }
});
