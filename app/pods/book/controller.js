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

  fontSizes: [
    10,
    12,
    14,
    16,
    18
  ],

  fontSizeString: Ember.computed('fontSize', function() {
    return Ember.String.htmlSafe(this.get('fontSize') + 'pt');
  }),

  modal: Ember.inject.service('bootstrap-modal'),

  actions: {
    // nextSection() {
    //   let index = this.get('model.sections').lastIndexOf(this.get('section.model'));
    //   let nextSection = this.get('model.sections').objectAt(index + 1);
    //   if (nextSection) {
    //     this.transitionToRoute('book.section', this.get('model'), nextSection);
    //   }
    // },
    // prevSection() {
    //   let index = this.get('model.sections').lastIndexOf(this.get('section.model'));
    //   let prevSection = this.get('model.sections').objectAt(index - 1);
    //   if (prevSection) {
    //     this.transitionToRoute('book.section', this.get('model'), prevSection);
    //   }
    // },
    changePermalink(permalink) {
      Ember.$('.book-loading-overlay').show();

      this.send('changeSection', this.get('model.sections').findBy('permalink', permalink));
      // Ember.run.later(() => this.transitionToRoute('book.section', this.get('model'), ), 100);
    },

    showImageModal(image) {
      this.set('modal.component', 'book-image-modal');
      this.set('modal.args.image', image);

      Ember.$('.modal').modal('show');
    }
  }
});
