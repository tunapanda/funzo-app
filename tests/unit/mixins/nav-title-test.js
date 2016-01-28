import Ember from 'ember';
import NavTitleMixin from '../../../mixins/nav-title';
import { module, test } from 'qunit';

module('Unit | Mixin | nav title');

// Replace this with your real tests.
test('it works', function(assert) {
  let NavTitleObject = Ember.Object.extend(NavTitleMixin);
  let subject = NavTitleObject.create();
  assert.ok(subject);
});
