import Ember from 'ember';
import ENV from 'funzo-app/config/environment';

export default Ember.Controller.extend({
  bookOnlyMode: ENV.APP.bookOnlyMode
});