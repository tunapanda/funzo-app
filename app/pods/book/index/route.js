import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
  showBackButton: true,
  afterModel(model) {
    this.set('navBarTitle', model.get('book.title'));
    return this._super(...arguments);
    // model.set('modules', this.store.query('module', { course: model.get('id') }));
  },

  redirect(model) {
    // this._super(...arguments);
    return this.transitionTo('book.section', model, model.get('sections.firstObject'));
  }
});
