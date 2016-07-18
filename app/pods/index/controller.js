import Ember from 'ember';
import ENV from 'funzo-app/config/environment';

export default Ember.Controller.extend({
  bookManager: Ember.inject.service(),

  bookOnlyMode: ENV.APP.bookOnlyMode,
  modal: Ember.inject.service('bootstrap-modal'),
  bookDir: Ember.computed('bookManager.bookDir', function() {
    return this.get('bookManager.bookDir');
  }),

  init() {
    this.get('bookManager').on('booksUpdated', (books) => {
      this.store.pushPayload('book', { books });
      this.set('model.books', this.store.peekAll('book'));
    });
    return this._super();
  },

  actions: {
    addBook() {
      this.set('modal.component', 'add-book');

      Ember.$('.modal').modal('show');
    }
  }
});