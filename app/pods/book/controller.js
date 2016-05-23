import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    changeSection() {
      Ember.$('.book-loading-overlay').show();
      let permalink = Ember.$('.change-section').val();

      Ember.run.later(() => this.transitionToRoute('book.section', this.get('model'), this.get('model.sections').findBy('permalink', permalink)), 100);
    }
  }
});
