import Ember from 'ember';

export default Ember.Controller.extend({
  currentUser: Ember.inject.service('currentUser'),
  actions: {
    xAPIEvent(event) {
      event.data.statement.actor.account = {
        id: this.get('currentUser.model.id'),
        name: this.get('currentUser.model.fullName'),
        homePage: 'http://tunapanda.org'
      };

      event.data.statement.object.id = `http://tunapanda.org/funzo/${this.get('model.course.permalink')}.${this.get('model.permalink')}`;

      let statement = this.store.createRecord('x-api-statement', { content: event.data.statement, user: this.get('currentUser.model') });
      statement.save();
      console.log(event);
    }
  }
});
