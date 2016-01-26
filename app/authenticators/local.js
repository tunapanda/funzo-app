import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';

export default Base.extend({
  init() {
    this.store = this.container.lookup('service:store');
    this._super(...arguments);
  },
  restore(data) {
    return new Ember.RSVP.Promise((resolve) => {
      this.store.find('user', data.id).then((model) => {
        return resolve({ id: model.get('id') });
      });

    });
  },
  authenticate(data) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      return this.store.find('user', data.id).then((model) => {
        if (model.get('pin') !== Ember.get(data, 'pin')) {
          return reject();
        }
        model.set('isAuthenticated', true);
        model.save().then(() => resolve({ id: model.get('id') }));
      });
    });
  },
  invalidate(data) {
    return this.store.find('user', data.id).then((model) => {
      model.set('isAuthenticated', false);
      return model.save();
    });
  }
});