/* global zip */
import Ember from 'ember';
import ENV from 'funzo-app/config/environment';

var dftCode = ENV.APP.defaultBook.code || "";
var dftHint = ENV.APP.defaultBook.hint || "";

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

  code: dftCode,
  hint: dftHint,

  didInsertElement() {
    this.get('bookManager').reset();
  },

  actions: {
    submit() {
      if (!window.cordova) {
        return alert('only works in app');
      }

      this.get('bookManager').addEPUB(this.get('code'))
        .then(() => {
          Ember.$('.modal').modal('hide');
        });
      // }, (error) => {
      //   console.log('download error source ' + error.source);
      //   console.log('download error target ' + error.target);
      //   console.log('upload error code' + error.code);
      // });
    },

    submitFile() {
      let file = this.$('.book-file')[0].files[0];

      var reader = new FileReader();

      reader.readAsArrayBuffer(file);

      reader.onload = () => {
        this.get('bookManager').addEPUBFromFile(reader.result).then(() => {
          Ember.$('.modal').modal('hide');
        });
      };

      // zip.workerScripts = {
      //   deflater: ['/zip/z-worker.js', '/zip/zlib.js', '/zip/zlib-asm/codecs.js'],
      //   inflater: ['/zip/z-worker.js', '/zip/zlib.js', '/zip/zlib-asm/codecs.js']
      // };

      // let file = this.$('.book-file')[0].files[0];

      // var reader = new FileReader();

      // reader.readAsDataURL(file);

      // let sections = [];
      // reader.addEventListener("load", () => {
      //   zip.createReader(new zip.Data64URIReader(reader.result), (reader) => {
      //     reader.getEntries((entries) => {
      //       if (entries.length) {
      //         new Ember.RSVP.Promise((resolve1) => {
      //           entries.forEach((entry) => {
      //             if (entry.filename.indexOf('__MACOSX') === -1 && entry.filename.substr(-4) === "html") {
      //               console.log(entry.filename);
      //               sections.push(new Ember.RSVP.Promise((resolve) => entry.getData(new zip.TextWriter(), function(text) {
      //                 resolve(text);
      //               })));
      //             }
      //           });
      //           resolve1();
      //         }).then(() => {
      //           Ember.RSVP.all(sections).then((sections) => {
      //             console.log(sections);
      //             this.attrs.openEPUB(sections);
      //             Ember.$('.modal').modal('hide');
      //           });
      //         });
      //       }
      //     });
      //     // reader.close();
      //   });
      // }, false);
    },

    cancel() {
      if (this.get('bookManager.download') && this.get('isDownloading')) {
        this.get('bookManager.download').abort();
      }
      this.get('bookManager').reset();
    }
  }
});
