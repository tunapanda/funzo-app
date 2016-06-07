import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['subsection'],
  subsection: null,
  actions: {
    nextSection() {
      let index = this.get('model.book.sections').lastIndexOf(this.get('model'));
      let nextSection = this.get('model.book.sections').objectAt(index + 1);
      if (nextSection) {
        this.transitionToRoute('book.section', this.get('model.book'), nextSection);
      }
    },
    prevSection() {
      let index = this.get('model.book.sections').lastIndexOf(this.get('model'));
      let prevSection = this.get('model.book.sections').objectAt(index - 1);
      if (prevSection) {
        this.transitionToRoute('book.section', this.get('model.book'), prevSection);
      }
    },
    changeSection(permalink) {
      Ember.$('.book-loading-overlay').show();

      Ember.run.later(() => this.transitionToRoute('book.section', this.get('model.book'), this.get('model.book.sections').findBy('permalink', permalink)), 100);
    }
  }
});