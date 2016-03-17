import Ember from 'ember';

export default Ember.Component.extend({
  init() {
    this.set('activities.firstObject.active', true);
    return this._super();
  },

  actions: {
    selectTab(permalink) {
      this.$(`#${permalink}`).tab('show');
      Ember.setEach(this.get('activities'), 'active', true);
      Ember.set(this.get('activities').findBy('permalink', permalink), 'active', true);
    }
  }
});
