import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';

function stringGen(len) {
  var text = " ";

  var charset = "abcdefghijklmnopqrstuvwxyz0123456789 ";

  for (var i = 0; i < len; i++) {
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return text;
}

moduleForComponent('a-book', 'Integration | Component | Book', {
  integration: true
});

let sections = [new Ember.Object({
  permalink: 'section-1',
  html: '<a href="#" id="section-1" data-permalink="section-1" class="anchor section-anchor section-section-1"></a>This is Section 1'
})];

test('should render a section', function(assert) {
  assert.expect(1);

  this.set('sections', sections);

  this.render(hbs`{{a-book sections=sections}}`);

  assert.equal(this.$('.section-section-1').text().trim(), sections[0].html, 'renders the section');
});

test('should page forward and back', function(assert) {
  assert.expect(1);

  sections[0].set('html', stringGen(10000));

  this.set('sections', sections);

  this.render(hbs`{{a-book sections=sections disableScrollAnimation=true}}`);

  this.$('.book-navigation-right').click();

  return wait().then(() => {
    assert.equal(this.$('.book-content-container').scrollLeft() > 0, true);
  });

});
