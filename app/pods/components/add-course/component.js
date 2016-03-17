/* global BackgroundTransfer */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['modal-dialog'],
  progress: 0,
  zipProgress: 0,
  status: 'idle',

  isIdle: Ember.computed.equal('status', 'idle'),
  isDownloading: Ember.computed.equal('status', 'downloading'),
  isUnzipping: Ember.computed.equal('status', 'unzipping'),
  isComplete: Ember.computed.equal('status', 'complete'),

  title: 'Add Course',

  url: 'http://192.168.1.100/funzo-CSE-1000.zip',

  actions: {
    submit() {
      if (!window.cordova) {
        return alert('only works in app');
      }
      let courseID = Math.random().toString(36).substring(7);
      let destDir = window.cordova.file.externalDataDirectory || window.cordova.file.dataDirectory;
      let zipDest = `${destDir}tmp/${courseID}.zip`;
      let coursesDir = `${destDir}courses/`;

      this.set('status', 'downloading');

      Ember.RSVP.all([
        this.createDirectory(destDir, 'tmp'),
        this.createDirectory(destDir, 'courses')
      ])
      .then(() => this.fileTransfer(this.get('url'), `${destDir}tmp`, `${courseID}.zip`))
      // .then(() => this.createDirectory(coursesDir, courseID))
      .then(() => {
        this.set('status', 'unzipping');

        return this.unzip(zipDest, `${coursesDir}`);
      })
      .then(() => {
        this.set('status', 'complete');
      }, (error) => {
        console.log('download error source ' + error.source);
        console.log('download error target ' + error.target);
        console.log('upload error code' + error.code);
      });
    },
    cancel() {
      if (this.get('isDownloading')) {
        this.get('download').stop();
      }
    }
  },

  createDirectory(dest, folder) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(dest, function(dir) {
        dir.getDirectory(folder, { create: true }, function(file) {
          if (file) {
            return resolve(file);
          }
          return reject();
        });
      });
    });
  },

  // fileTransfer(uri, destination, trustAllHosts = true, options = {}) {
  //   let fileTransfer = new FileTransfer();
  //   fileTransfer.onprogress = (e) => {
  //     if (e.lengthComputable) {
  //       this.set('progress', Math.ceil(100 * e.loaded / e.total));
  //     } else {
  //       this.incrementProperty('progress');
  //     }
  //   };
  //   return new Ember.RSVP.Promise((resolve, reject) =>
  //     fileTransfer.download(uri, destination, resolve, reject, trustAllHosts, options));
  // },

  fileTransfer(uri, destDir, destFile) {
    let downloader = new BackgroundTransfer.BackgroundDownloader();
    let onprogress = (e) => {
      this.set('progress', Math.ceil(100 * e.bytesReceived / e.totalBytesToReceive));
    };

    return new Ember.RSVP.Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(destDir, dir => {
        dir.getFile(destFile, { create: true }, file => {
          let download = downloader.createDownload(uri, file);
          this.set('download', download);
          return download.startAsync().then(resolve, reject, onprogress);
        });
      });
    });
  },

  unzip(source, dest) {
    return new Ember.RSVP.Promise((resolve, reject) => window.zip.unzip(source, dest, (result) => (result < 0) ? reject() : resolve(), (e) => {
      if (e.lengthComputable) {
        this.set('zipProgress', Math.ceil(100 * e.loaded / e.total));
      } else {
        this.incrementProperty('zipProgress');
      }
    }));
  }
});
