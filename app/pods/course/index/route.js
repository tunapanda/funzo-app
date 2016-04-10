import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
  showBackButton: true,

  afterModel(model) {
    this.set('navBarTitle', model.get('title'));
    return this._super(...arguments);
    // model.set('modules', this.store.query('module', { course: model.get('id') }));
  }
});
