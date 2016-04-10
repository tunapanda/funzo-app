import Ember from 'ember';
import EmberValidations from 'ember-validations';

export default Ember.Controller.extend(EmberValidations, {
  submitted: false,

  validations: {
    'model.firstName': {
      presence: {
        if: 'submitted'
      },
      format: {
        with: /^[a-zA-Z ]+$/,
        if: 'submitted'
      }
    },
    'model.lastName': {
      presence: {
        if: 'submitted'
      },
      format: {
        with: /^[a-zA-Z ]+$/,
        if: 'submitted'
      }
    },
    'oldpin': {
      presence: {
        if: 'submitted'
      },
      numericality: {
        onlyInteger: true,
        greaterThan: 999 // at least 4 digits
      }
    },
    'newpin': {
      presence: {
        if: 'submitted'
      },
      numericality: {
        onlyInteger: true,
        greaterThan: 999 // at least 4 digits
      }
    }
  },

  actions: {
    modify() {
      this.set('submitted', true);
      this.validate()
      .then(() => {
        if (this.get('oldpin') !== this.get('model.pin')) {
          return Ember.RSVP.reject('Old PIN incorrect');
        }
        return this.set('model.pin', this.get('newpin'));
      })
      .then(() => this.get('model').save())
      .catch((error) => {
        if (typeof error === 'string') {
          this.set('errorMessage', error);
        }
      });
    }
  }
});
