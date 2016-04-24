import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  urlForFindRecord(permalink, modelName, snapshot) {
    return `content/books/${snapshot.record.get('book.id')}/${permalink}.json`;
  },

  urlForQuery(query) {
    return `content/books/${query.book_id}/index.json`;
  },

  urlForQueryRecord(query) {
    return `content/books/${query.book_id}/${query.section_id}.json`;
  }
});