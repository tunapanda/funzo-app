import Ember from 'ember';
const { $, ObjectProxy, computed } = Ember; // jshint ignore:line

let SectionDecorator = ObjectProxy.extend({
  isHidden: false,
  isCurrentSection: false,
  isVisible: Ember.computed.not('isHidden'),
  startPosition: 0,
  endPosition: 0
});

export default Ember.Controller.extend({
  nav: Ember.inject.service(),
  // section: Ember.inject.controller('book.section'),
  bookmarks: Ember.inject.service(),

  queryParams: {
    location: 'section'
  },

  // this method can take a second argument, but since we're not
  // using it right now jshint will complain if it's references.
  // sections: computed.map('model.sections', function(model, i) {
  // sections: computed.map('model.sections', function(model) {
  //   return SectionDecorator.create({ content: model });
  // }),

  startingScrollLeft: Ember.computed('bookmarks.currentPosition', function() {
    console.log("Getting computed position attribute:", this.get("bookmarks.currentPosition"));
    return this.get("bookmarks.currentPosition");
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
    },

    onPageChange(scrollLeft) {
      this.send('updateUserBookmark', scrollLeft);
    },

    locationChanged(href) {
      this.set('location', href);
    },

    sectionClick(href) {
      $('#chapters').modal('hide');
      Ember.$('.book-loading-overlay').show();
      this.set('location', href);
    }

  }
});
