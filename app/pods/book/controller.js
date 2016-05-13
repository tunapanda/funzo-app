import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    changeSection() {
      let permalink = Ember.$('.change-section').val();

      this.transitionToRoute('book.section', this.get('model'), this.get('model.sections').findBy('permalink', permalink));
    }
  }
});
