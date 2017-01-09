import Ember from 'ember';
import ENV from 'funzo-app/config/environment';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  ENV: ENV,

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
