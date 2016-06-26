import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  session: Ember.inject.service('session'),
  nav: Ember.inject.service('nav'),

  actions: {
    back() {
      history.back();
    },

    openLink(url) {
      window.open(url, '_system');
    },
    sessionInvalidated() {
      this.transitionTo('login.index');
    }
  },

  sessionInvalidated() {
    this.transitionTo('login.index');
  }
});