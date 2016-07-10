import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  urlForFindRecord(permalink, modelName, snapshot) {
    let url = `content/books/${snapshot.record.get('book.id')}/${permalink}.json`;
    if (window.cordova) {
      url = window.cordova.file.externalDataDirectory + url;
    }
    return url;
  },

  urlForQuery(query) {
    let url = `content/books/${query.book_id}/index.json`;
    if (window.cordova) {
      url = window.cordova.file.externalDataDirectory + url;
    }
    return url;
  },

  urlForQueryRecord(query) {
    let url = `content/books/${query.book_id}/${query.section_id}.json`;
    if (window.cordova) {
      url = window.cordova.file.externalDataDirectory + url;
    }
    return url;
  }
});