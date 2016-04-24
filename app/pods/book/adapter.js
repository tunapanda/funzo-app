import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  urlForFindAll() {
    return 'local_books.json';
  },

  urlForFindRecord(permalink) {
    return `content/books/${permalink}/book.json`;
  },

  urlForFindHasMany(id, modelName, snapshot) {
    debugger;
    this._super(id, modelName, snapshot);
  }
});