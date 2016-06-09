import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  urlForFindAll() {
    return 'content/courses/index.json';
  },

  urlForFindRecord(permalink) {
    return `content/courses/${permalink}/content.json`;
  }
});