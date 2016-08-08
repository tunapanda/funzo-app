import Ember from 'ember';

export default Ember.Controller.extend({
  nav: Ember.inject.service(),
  currentUser: Ember.inject.service(),
  section: Ember.inject.controller('book.section'),

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

  scrollLeft: Ember.computed('currentUser.model.placeholders.[]', {
    get() {
      let placeholder = this.get('currentUser.model.placeholders').findBy('book', this.get('model.id'));

      return placeholder ? Ember.get(placeholder, 'scrollLeft') : 0;
    },
    set(key, scrollLeft) {
      let placeholder = this.get('currentUser.model.placeholders').findBy('book', this.get('model.id'));
      if (!placeholder) {
        return this.get('currentUser.model.placeholders').pushObject({ book: this.get('model.id'), scrollLeft });
      }
      Ember.set(placeholder, 'scrollLeft', scrollLeft);
      this.get('currentUser.model.content').save();
    }
  }),

  actions: {
    nextSection() {
      let index = this.get('model.sections').lastIndexOf(this.get('section.model'));
      let nextSection = this.get('model.sections').objectAt(index + 1);
      if (nextSection) {
        this.transitionToRoute('book.section', this.get('model'), nextSection);
      }
    },
    prevSection() {
      let index = this.get('model.sections').lastIndexOf(this.get('section.model'));
      let prevSection = this.get('model.sections').objectAt(index - 1);
      if (prevSection) {
        this.transitionToRoute('book.section', this.get('model'), prevSection);
      }
    },
    changeSection(permalink) {
      Ember.$('.book-loading-overlay').show();
      permalink = permalink || Ember.$('.change-section').val();

      Ember.run.later(() => this.transitionToRoute('book.section', this.get('model'), this.get('model.sections').findBy('permalink', permalink)), 100);
    },

    showImageModal(image) {
      this.set('modal.component', 'book-image-modal');
      this.set('modal.args.image', image);

      Ember.$('.modal').modal('show');
    },

    didScroll(scrollLeft) {
      let user = this.get('user');
      user.set(`${this.get('book.id')}`, scrollLeft);
      user.save();
    }
  }
});
