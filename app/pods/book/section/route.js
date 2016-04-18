import Ember from 'ember';

export default Ember.Route.extend({
    model: function(params) {
      return {
        "id": params.section_id,
        "book_id": params.book_id,
        "title": "Book " + params.book_id + ", Section " + params.section_id
      };
    }
});

