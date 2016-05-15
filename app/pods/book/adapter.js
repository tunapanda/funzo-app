import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  urlForFindAll() {
    return 'content/books/local_books.json';
  },

  urlForFindRecord(permalink) {
    return `content/books/${permalink}/book.json`;
  },

  urlForFindHasMany(id, modelName, snapshot) {
    this._super(id, modelName, snapshot);
  }
});