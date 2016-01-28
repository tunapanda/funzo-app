import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.findAll('user');
  },
  
  actions: {
    userSelected(model) {
      this.trigger('userSelected', model);
      this.transitionTo('login.pin', model);
    },
  }
});
