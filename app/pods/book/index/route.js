import Ember from 'ember';

export default Ember.Route.extend({
  redirect(model) {
    return this.transitionTo('book.section', model, model.get('sections.firstObject'));
  }
});
