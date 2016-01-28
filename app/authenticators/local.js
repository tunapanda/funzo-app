import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';

export default Base.extend({
  store: Ember.inject.service('store'),

  restore(data) {
    return new Ember.RSVP.Promise(() => {
      return this.get('store').find('user', data.id).then((model) => {
        return Ember.RSVP.resolve({ id: model.get('id') });
      });
    });
  },
  authenticate(data) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      return this.get('store').find('user', data.id).then((model) => {
        if (model.get('pin') !== Ember.get(data, 'pin')) {
          return reject();
        }
        model.set('isAuthenticated', true);
        model.save().then(() => resolve({ id: model.get('id') }));
      });
    });
  },
  invalidate(data) {
    return this.get('store').find('user', data.id).then((model) => {
      model.set('isAuthenticated', false);
      return model.save();
    });
  }
});