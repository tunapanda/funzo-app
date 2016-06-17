import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.store.find('book', params.book_id).then((book) => {
      return book.get('sections').then(() => {
        return Ember.RSVP.resolve(book);
      });
    });
  }
});
