import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
  nav: Ember.inject.service(),

  showBackButton: true,
  
  model: function(params) {
    return this.store.queryRecord('section', { book_id: this.paramsFor('book').book_id, section_id: params.section_id });
  },

  afterModel(model) {
    this.set('navBarTitle', model.get('book.title'));

    this.controllerFor('book').set('currentSection', model);

    return this._super(...arguments);
  },

  hideNavBar: function() {
    this.set('nav.hide', true);
    this.set('nav.bookMode', true);
  }.on('activate'),

  showNavBar: function() {
    this.set('nav.hide', false);
    this.set('nav.bookMode', false);
  }.on('deactivate'),

  hideStatusBar: function() {
    this.set('indexOnly', true);
    this.set('showBackButton', true);
    window.StatusBar && window.StatusBar.hide();

    document.addEventListener('resume', this.hideStatusBarResume, false);

  }.on('activate'),

  showStatusBar: function() {
    this.set('indexOnly', false);
    window.StatusBar && window.StatusBar.show();

    document.removeEventListener('resume', this.hideStatusBarResume, false);

  }.on('deactivate'),

  hideStatusBarResume() {
    window.StatusBar && window.StatusBar.hide();
  }
});

