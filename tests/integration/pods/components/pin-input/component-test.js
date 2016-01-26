import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pin-input', 'Integration | Component | pin input', {
  integration: true
});

test('it renders', function(assert) {
  
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.render(hbs`{{pin-input value=pin}}`);


  this.$('.digit-1').val('1');
  debugger;
  assert.equal(this.get('pin'), '1');

});
