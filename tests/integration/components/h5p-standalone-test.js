import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('h5p-standalone', 'Integration | Component | h5p standalone', {
  integration: true
});

test('it renders', function(assert) {
  
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.render(hbs`{{h5p-standalone}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:" + EOL +
  this.render(hbs`
    {{#h5p-standalone}}
      template block text
    {{/h5p-standalone}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
