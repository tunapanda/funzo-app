import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(AuthenticatedRouteMixin, NavBarTitleMixin, {
  navBarTitle: 'Course List',
  
  model() {
    let findCourse = this.store.findAll('course');
    
    findCourse.then((courses) => courses.forEach((model) => model.set('modules', this.store.query('module', { course: model.get('id') }))));
    return findCourse;
  }
});
