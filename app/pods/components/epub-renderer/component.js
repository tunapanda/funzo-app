import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['book-content-container'],

  didInsertElement() {
    let book = ePub('content/epubs/sample-epub/');

    book.renderTo(this.$()[0]);

    this.book = window.book = book;
  },

  navNext() {
    this.book.nextPage();
  },

  navPrev() {
    this.book.prevPage();
  }
});
