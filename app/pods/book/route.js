import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
// export default Ember.Route.extend({

  showBackButton: true,
  model(params) {
    return this.store.find('book', params.book_id).then((book) => {
      return book.get('sections').then(() => {
        return Ember.RSVP.resolve(book);
      });
    });
  },

  // afterModel(model) {
  //   this.set('navBarTitle', model.get('title'));
  //   return this._super(...arguments);
  // }
});
