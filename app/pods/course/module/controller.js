import Ember from 'ember';

export default Ember.Controller.extend({
  currentUser: Ember.inject.service('currentUser'),

  actions: {
    xAPIEvent(event) {
      event.data.statement.actor.account = {
        id: this.get('currentUser.model.id'),
        name: this.get('currentUser.model.fullName')
      };

      let statement = this.store.createRecord('x-api-statement', { content: event.data.statement, user: this.get('currentUser.model') });
      statement.save();
      console.log(event);
    }
  }
});
