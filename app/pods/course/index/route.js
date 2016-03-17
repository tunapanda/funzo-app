import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
  afterModel(model) {
    this.set('nav.title', model.get('title'));

    // model.set('modules', this.store.query('module', { course: model.get('id') }));
  }
});
