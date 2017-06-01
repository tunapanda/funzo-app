import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
  crypto: Ember.inject.service(),
  bookmarks: Ember.inject.service(),
  nav: Ember.inject.service(),

  showBackButton: true,

  beforeModel() {
    return this.get('bookmarks').start();
  },

  model(params) {
    return this.store.find('book', params.book_id);
  },

  hideNavBar: function () {
    this.set('nav.hide', true);
    this.set('nav.bookMode', true);
  }.on('activate'),

  showNavBar: function () {
    this.set('nav.hide', false);
    this.set('nav.bookMode', false);
  }.on('deactivate'),

  hideStatusBar: function () {
    this.set('indexOnly', true);
    this.set('showBackButton', true);
    if (window.StatusBar) {
      window.StatusBar.hide();
    }

    document.addEventListener('resume', this.hideStatusBarResume, false);

  }.on('activate'),

  showStatusBar: function () {
    this.set('indexOnly', false);
    if (window.StatusBar) {
      window.StatusBar.show();
    }

    document.removeEventListener('resume', this.hideStatusBarResume, false);

  }.on('deactivate'),

  // afterModel(model) {
  //   this.get('bookmarks').openBook(model);

  //   /**
  //    * decrypt the sections
  //    **/
  //   return model.get('sections').then(
  //     sections => Ember.RSVP.all(sections.map(
  //       section => this.get('crypto').decryptSection(section)
  //     ))
  //   );
  // },

  actions: {
    changeSection(section) {
      this.replaceWith('book.section', this.get('controller.model'), section);
    },

    updateUserBookmark(scrollLeft) {
      this.get('bookmarks').updatePosition(scrollLeft);
    },
    backToIndex() {
      this.transitionTo('index');
    }
  }
});
