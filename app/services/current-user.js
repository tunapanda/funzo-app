import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Service.extend({
  session: Ember.inject.service('session'),
  store: Ember.inject.service('store'),
  
  model: Ember.computed(function() {
    return DS.PromiseObject.create({
      promise: this.get('store').find('user', this.get('session.session.authenticated.id'))
    });
  })
});
