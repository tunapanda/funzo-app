/* global H5P */
import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement() {
    H5P.jQuery('.h5p-container').h5p({
      frameJs: 'assets/h5p-standalone-frame.min.js',
      frameCss: 'assets/h5p.css',
      h5pContent: 'assets/workspace'
    });
  }
});
