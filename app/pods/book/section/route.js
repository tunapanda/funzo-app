import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
  showBackButton: true,
  model: function(params) {
    return this.store.queryRecord('section', {book_id: this.paramsFor('book').book_id, section_id: params.section_id});
  },

  actions: {
    didTransition() {
      this.controllerFor('application').set('navbarFixed', true);
    },

    willTransition() {
      this.controllerFor('application').set('navbarFixed', false);
    }
  }
});

