import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  session: Ember.inject.service('session'),
  
  actions: {
    logout() {
      this.get('session').invalidate();
    },
    
    back() {
      history.back();
    },

    openLink(url) {
      window.open(url, '_system');
    }
  }
});
