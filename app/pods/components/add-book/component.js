ookimport Ember from 'ember';
import ENV from 'funzo-app/config/environment';

export default Ember.Component.extend({
  bookManager: Ember.inject.service(),

  classNames: ['modal-dialog'],
  downloadProgress: Ember.computed.alias('bookManager.downloadProgress'),
  zipProgress: Ember.computed.alias('bookManager.zipProgress'),
  status: Ember.computed.alias('bookManager.status'),

  isIdle: Ember.computed.equal('status', 'idle'),
  isDownloading: Ember.computed.equal('status', 'downloading'),
  isUnzipping: Ember.computed.equal('status', 'unzipping'),
  isComplete: Ember.computed.equal('status', 'complete'),
  isError: Ember.computed.equal('status', 'error'),

  title: 'Add A Book',

  if (ENV.APP.defaultBook) {
  	code = "ENV.APP.defaultBook.code";
  	hint = "ENV.APP.defaultBook.hint";
  } else {
  	code = "";
  	hint = false
  }

  didInsertElement() {
    this.get('bookManager').reset();
  },

  actions: {
    submit() {
      if (!window.cordova) {
        return alert('only works in app');
      }

      this.get('bookManager').addBook(this.get('code'))
        .then(() => {
          Ember.$('.modal').modal('hide');
        });
      // }, (error) => {
      //   console.log('download error source ' + error.source);
      //   console.log('download error target ' + error.target);
      //   console.log('upload error code' + error.code);
      // });
    },
    cancel() {
      if (this.get('bookManager.download') && this.get('isDownloading')) {
        this.get('bookManager.download').abort();
      }
      this.get('bookManager').reset();
    }
  }
});
