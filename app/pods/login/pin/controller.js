import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  actions: {
    login() {
      this.get('session').authenticate('authenticator:local', { id: this.get('model.id'), pin: this.get('pin') })
      .then(() => this.transitionToRoute('index'));
    }
  },

  _pin: Ember.observer('pin', function() {
    console.log(this.get('pin'));
  })
});
