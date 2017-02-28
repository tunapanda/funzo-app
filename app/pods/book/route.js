import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
  crypto: Ember.inject.service(),
  bookmarks: Ember.inject.service(),

  showBackButton: true,

  activate() {
    // this.sendAction('xAPIOpenBook', this.modelFor('book'));
  },

  beforeModel() {
    return this.get('bookmarks').start();
  },

  model(params) {
    return this.store.find('book', params.book_id);
  },

  afterModel(model) {
    this.get('bookmarks').openBook(model);

    /**
     * decrypt the sections
     **/
    return model.get('sections').then(
      sections => Ember.RSVP.all(sections.map(
        section => this.get('crypto').decryptSection(section)
      ))
    );
  },

  actions: {
    changeSection(section) {
      this.replaceWith('book.section', this.get('controller.model'), section);
    },

    updateUserBookmark(scrollLeft) {
      this.get('bookmarks').updatePosition(scrollLeft);
    }
  }
});
