import Ember from 'ember';

export default Ember.Controller.extend({
  section: Ember.inject.controller('book.section'),

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
    }
  }
});
