import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),

  actions: {
    selectUser(model) {
      this.set('selectedUser', model);
    },

    login() {
      this.get('session').authenticate('authenticator:local', { id: this.get('selectedUser.id'), pin: this.get('pin') })
        .then(() => this.transitionToRoute('index'));
    }
  }
});
