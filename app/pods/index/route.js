import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(AuthenticatedRouteMixin, NavBarTitleMixin, {
  navBarTitle: 'Course List',

  model() {
    let findCourse = this.store.findAll('course');
    return findCourse;
  }
});
