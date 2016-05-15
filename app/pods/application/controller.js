import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  modal: Ember.inject.service('bootstrap-modal'),

  navbarFixed: false,

  actions: {
    logout() {
      this.get('session').invalidate();
    },

    back() {
      history.back();
    }
  }
});
