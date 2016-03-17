import Ember from 'ember';

export default Ember.Route.extend({
  redirect(model) {
    // this._super(...arguments);
    return this.transitionTo('course.module.activity', model.get('course'), model, model.get('activities.firstObject'));
  }
});
