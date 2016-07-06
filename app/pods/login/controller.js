import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),

  actions: {
    selectUser(model) {
      this.set('selectedUser', model);
    },

    getStarted() {
      this.get('model').save()
      .then(() => this.get('session').authenticate('authenticator:local', { id: this.get('model.id') }))
      .then(() => this.transitionToRoute('index'));
    }
  }
});
