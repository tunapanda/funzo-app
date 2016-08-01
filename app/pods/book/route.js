import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
  crypto: Ember.inject.service(),

  showBackButton: true,
  model(params) {
    return this.store.find('book', params.book_id);
  },

  /**
   * decrypt the sections
   **/
  afterModel(model) {
    return model.get('sections').then(sections => Ember.RSVP.all(sections.map(section => this.get('crypto').decryptSection(section))));
  }
});
