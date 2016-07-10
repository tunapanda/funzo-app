import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  session: Ember.inject.service('session'),
  nav: Ember.inject.service('nav'),
  bookManager: Ember.inject.service(),

  beforeModel() {
    return this.get('bookManager').updateIndex().then(this._super);
  },

  actions: {
    back() {
      if (this.get('nav.indexOnly')) {
        return this.transitionTo('index', this.modelFor('index'));
      }
      history.back();
    },

    openLink(url) {
      window.open(url, '_system');
    },
    sessionInvalidated() {
      this.transitionTo('login');
    }
  },

  sessionInvalidated() {
    this.transitionTo('login');
  }
});