import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';
import ENV from 'funzo-app/config/environment';

export default Ember.Route.extend(AuthenticatedRouteMixin, NavBarTitleMixin, {
  navBarTitle: 'My Library',
  showBackButton: false,
  showNavBar: true,

  bookOnlyMode: ENV.APP.bookOnlyMode,

  model() {
    let models = {
      books: this.store.findAll('book')
    };

    if (!this.get('bookOnlyMode')) {
      models.courses = this.store.findAll('course');
    }

    return Ember.RSVP.hash(models);
  },

  afterModel(model) {
    return model.books.map(book => book.get('sections.firstObject'));
  },

  activate() {
    this.set('showBackButton', false);
    this.set('nav.showIcons', true);
    this.set('nav.hide', false);
  }
});
