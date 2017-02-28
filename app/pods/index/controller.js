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
    this.get('bookManager').on('booksUpdated', () => {
      // this.store.pushPayload('book', { books });
      this.store.unloadAll('book');
      this.store.findAll('book', { reload: true }).then((books) => this.set('model.books', books));
    });
    return this._super();
  },

  actions: {
    addBook() {
      this.set('modal.component', 'add-book');

      Ember.$('.modal').modal('show');
    },
    deleteBook(book) {
      if (window.confirm(`Are you sure you want to delete "${book.get('title')}"?`)) {
        this.get('bookManager').deleteBook(book.get('id'));
      }
    }
  }
});
