import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    close() {
      Ember.$('.modal').modal('hide');
    }
  }
});
