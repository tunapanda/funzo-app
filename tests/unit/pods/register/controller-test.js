import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
// import {
//   testValidPropertyValues,
//   testInvalidPropertyValues
// } from '../../../helpers/validate-properties';

moduleFor('controller:register', 'Unit | Controller | register', {
  // Specify the other units that are required for this test.
  needs: [
    'service:validations',
    'ember-validations@validator:local/presence',
    'ember-validations@validator:local/numericality',
    'ember-validations@validator:local/format'
  ],
  setup() {
    this.subject().set('model', Ember.Object.create());
  }
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let controller = this.subject();
  assert.ok(controller);
});

// testValidPropertyValues('model.firstName', ['John', 'Bob', 'Stan']);
// testInvalidPropertyValues('model.firstName', ['', '123534', 'J0hn', 'J@ck']);

// testValidPropertyValues('model.lastName', ['John', 'Bob', 'Stan']);
// testInvalidPropertyValues('model.lastName', ['', '123534', 'J0hn', 'J@ck']);

// testValidPropertyValues('model.pin', ['1234', '9999', '123456']);
// testInvalidPropertyValues('model.pin', ['', '123', '12', '1', '4345asd', '1qwe', 'qwe1']);