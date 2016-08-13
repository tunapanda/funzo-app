/* global H5P */
import Ember from 'ember';

export default Ember.Component.extend({
  currentUser: Ember.inject.service('currentUser'),

  didInsertElement() {
    let h5pContent = `content/courses/${this.get('coursePath')}/modules/${this.get('modulePath')}`;
    h5pContent += `/${this.get('activityPath')}`;

    let frameJs = 'assets/h5p-standalone-frame.js';
    let frameCss = 'assets/funzo-app.css';

    this.get('currentUser.model').then(() => {
      // if (this.get('activityPath')) {
      //   H5P.jQuery(`#${this.get('activityPath')} .h5p-container`).h5p({ frameJs, frameCss, h5pContent });
      // } else {
      H5P.jQuery(`.h5p-container`).h5p({ frameJs, frameCss, h5pContent });

      // Ember.$(`.h5p-container iframe`).contents().find('head').append(Ember.$('<link/>', { rel: 'stylesheet', href: 'assets/funzo-app.css', type: 'text/css' }));
      // }

      H5P.externalDispatcher.on('xAPI', this.xAPI.bind(this));
    });
  },

  xAPI(event) {
    this.sendAction('action', event);
  }
});
