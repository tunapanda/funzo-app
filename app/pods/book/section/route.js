import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.store.queryRecord('section', {book_id: this.paramsFor('book').book_id, section_id: params.section_id});
  }
});

