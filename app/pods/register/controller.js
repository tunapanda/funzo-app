import Ember from 'ember';
import EmberValidations from 'ember-validations';

export default Ember.Controller.extend(EmberValidations, {
  session: Ember.inject.service('session'),
  submitted: false,

  validations: {
    'model.firstName': {
      presence: {
        if: 'submitted',
        message: 'First name is required.'
      },
      format: {
        with: /^[a-zA-Z ]+$/,
        if: 'submitted',
        message: 'Must only be letters and spaces.'
      }
    },
    'model.lastName': {
      presence: {
        if: 'submitted',
        message: 'Last name is required.'
      },
      format: {
        with: /^[a-zA-Z ]+$/,
        if: 'submitted',
        message: 'Must only be letters and spaces.'
      }
    },
    'model.pin': {
      presence: {
        if: 'submitted',
        message: 'A PIN is required.'
      },
      numericality: {
        onlyInteger: true,
        greaterThan: 999, // at least 4 digits
        if: 'submitted',
        message: 'Must be at least 4 digits.'
      }
    }
  },

  actions: {
    register() {
      this.set('submitted', true);
      this.validate().then(() => {
        return this.store.findAll('user');
      })
      .then((users) => {
        if (users.get('length') === 1) {
          this.set('model.isTeacher', true);
        }
        return this.get('model').save();
      })
      .then(() => this.get('session').authenticate('authenticator:local', { id: this.get('model.id'), pin: this.get('model.pin') }))
      .then(() => this.transitionToRoute('index'), (err) => console.error(err));
    }
  }
});
