/* global H5P */
import Ember from 'ember';

export default Ember.Component.extend({
  currentUser: Ember.inject.service('currentUser'),

  didInsertElement() {

    this.get('currentUser.model').then(() => {
      H5P.jQuery('.h5p-container').h5p({
        frameJs: 'assets/h5p-standalone-frame.js',
        frameCss: 'assets/h5p.css',
        h5pContent: `/courses/${this.get('coursePath')}/modules/${this.get('modulePath')}`
      });
      H5P.externalDispatcher.on('xAPI', this.xAPI.bind(this));
    });
  },

  xAPI(event) {
    this.sendAction('action', event);
  }
});
