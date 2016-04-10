import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
  currentUser: Ember.inject.service('currentUser'),
  navBarTitle: 'Edit Profile',
  showBackButton: true,

  model() {
    return this.get('currentUser.model');
  }
});
