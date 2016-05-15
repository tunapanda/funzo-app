import Ember from 'ember';

export default Ember.Controller.extend({
  app: Ember.inject.controller('application'),

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

    fixNavbar() {
      this.get('app').set('navbarFixed', true);
    },

    unfixNavbar() {
      this.get('app').set('navbarFixed', false);
    }
  }
});