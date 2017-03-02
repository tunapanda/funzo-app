import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  modal: Ember.inject.service('bootstrap-modal'),
  nav: Ember.inject.service('nav'),

  navbarFixed: false,

  actions: {
    logout() {
      this.get('session').invalidate();
    },

    back() {
      if (this.get('nav.indexOnly')) {
        return this.transitionToRoute('/');
      }
      history.back();
    },
    refreshIndex(books) {
      this.store.pushPayload('book', books);
    },

    openEPUB(sections) {
      let book = this.store.createRecord('book', { title: "Test EPUB", permalink: "test-epub" });

      sections = sections.map((section, i) => {
        return this.store.createRecord('section', { title: i, permalink: i, content: section, encryption: false, book: book });
      });

      book.set('sections', sections);
    },
  
    addBook() {
      this.set('modal.component', 'add-book');

      Ember.$('.modal').modal('show');
    }
  }
});
