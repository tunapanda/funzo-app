import Ember from 'ember';
const { $, ObjectProxy, computed } = Ember;

let SectionDecorator = ObjectProxy.extend({
  isHidden: false,
  isCurrentSection: false,
  isVisible: Ember.computed.not('isHidden'),
  startPosition: 0,
  endPosition: 0
});

export default Ember.Controller.extend({
  nav: Ember.inject.service(),
  section: Ember.inject.controller('book.section'),

  sections: computed.map('model.sections', function(model, i) {
    return SectionDecorator.create({ content: model });
  }),

  fontSize: 12,
  fontSizes: [10, 12, 14, 16, 18],

  fontSizeString: Ember.computed('fontSize', function() {
    return Ember.String.htmlSafe(this.get('fontSize') + 'pt');
  }),

  modal: Ember.inject.service('bootstrap-modal'),

  actions: {
    changePermalink(permalink) {
      Ember.$('.book-loading-overlay').show();

      this.send('changeSection', this.get('model.sections').findBy('permalink', permalink));
    },

    showImageModal(image) {
      this.set('modal.component', 'book-image-modal');
      this.set('modal.args.image', image);

      Ember.$('.modal').modal('show');
    }
  }
});
