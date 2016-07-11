/* global BackgroundTransfer */
import Ember from 'ember';
import ENV from 'funzo-app/config/environment';

export default Ember.Service.extend(Ember.Evented, {
  downloadProgress: 0,
  unzipProgress: 0,

  status: 'idle',

  init() {
    if (window.cordova) {
      this.set('baseDir', window.cordova.file.externalDataDirectory);
    } else {
      return;
      // window.webkitRequestFileSystem(window.PERMENANT, 10 * 1024 * 1024 , (fs) => { console.log(fs); }, () => {});
    }

    this.set('contentDir', `${this.get('baseDir')}content`);
    this.set('downloadDir', `${this.get('baseDir')}downloads`);

    this.set('bookDownloadDir', `${this.get('downloadDir')}/books`);
    this.set('bookDir', `${this.get('contentDir')}/books`);

    this.set('tmpDir', `${this.get('baseDir')}tmp`);

    this.createDirectory('tmp');

    this.createDirectory('content')
      .then(this.createDirectory('books', this.get('contentDir')));

    this.createDirectory('downloads')
      .then(this.createDirectory('books', this.get('downloadDir')));
  },

  reset() {
    this.setProperties({
      status: 'idle',
      downloadProgress: 0,
      unzipProgress: 0,
      download: null
    });
  },

  addBook(code) {
    this.set('status', 'downloading');
    return this.downloadBook(code)
      .then(() => {
        this.set('status', 'unzipping');
        return this.unzipBook(code);
      })
      .then(() => this.updateIndex())
      .then(() => {
        this.set('status', 'complete');
      }, (err) => {
        this.set('status', 'error');
        this.set('error', err);
      });
  },

  updateIndex() {
    return this.resolveFileURL(this.get('bookDir'))
      .then((bookDir) => {
        return this.readFolderContents(bookDir)
        .then((bookFolders) => {
          return Ember.RSVP.all(bookFolders.filterBy('isDirectory', true).map((bookFolder) => {
            return this.resolveFileURL(`${this.get('bookDir')}/${bookFolder.name}/book.json`)
              .then((file) => this.readFileContents(file));
          }));
        }).then((bookMetas) => {
          return Ember.RSVP.resolve(`[${bookMetas.join(',')}]`);
        }).then((indexContent) => {
          return this.createFile(bookDir, 'index.json')
            .then((indexFile) => this.writeFileContents(indexFile, indexContent))
            .then((indexContent) => {
              let json = JSON.parse(indexContent);
              this.trigger('booksUpdated', json);
              return Ember.RSVP.resolve(json);
            });
        });
      });
  },

  /**
   * Get the url from a code
   *
   * @param code {String}
   * @return {String} the url
   **/

  urlForBook(code) {
    if (code === 'demo' || code === 'demo-ndl') {
      return 'https://www.dropbox.com/s/tbfvbbotoaxp4m5/demo.zip?dl=1';
    }
    return `${ENV.APP.bookURLBase}${code}`;
  },

  /**
   * Start download of a book
   *
   * @param code {String}
   * @return {Promise}
   **/

  downloadBook(code) {
    let url = this.urlForBook(code);
    if (code === 'demo-ndl') {
      return Ember.RSVP.resolve();
    }
    return this.fileTransfer(url, `${this.get('bookDownloadDir')}/${code}.zip`);
  },

  /**
   * Unzip the book
   * unzip to a tmp location
   * read permalink
   * move to books/permalink
   **/
  unzipBook(code) {
    let zipPath = `${this.get('bookDownloadDir')}/${code}.zip`;
    let unzipDest = `${this.get('tmpDir')}/${code}`;

    return this.createDirectory(code, this.get('tmpDir'))
      .then(() => this.unzip(zipPath, unzipDest))
      .then(() => this.resolveFileURL(unzipDest + '/book.json'))
      .then((file) => this.readFileContents(file))
      .then((bookJSON) => {
        let bookMeta = JSON.parse(bookJSON);
        let permalink = bookMeta.permalink;

        return Ember.RSVP.hash({
          destFolder: this.resolveFileURL(this.get('bookDir')),
          unzipFolder: this.resolveFileURL(unzipDest)
        }).then((res) => {
          return this.moveFile(res.unzipFolder, res.destFolder, permalink);
        });
      });
  },

  createDirectory(folder, dest = '') {
    dest = (dest ? `${dest}` : this.get('baseDir'));

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

  fileTransfer(uri, destPath) {
    return new Ember.RSVP.Promise((res, rej) => {
      let fileTransfer = new window.FileTransfer();
      uri = encodeURI(uri);

      fileTransfer.onprogress = (e) => {
        if (e.lengthComputable) {
          this.set('downloadProgress', Math.ceil(100 * e.loaded / e.total));
        } else {
          this.incrementProperty('downloadProgress');
        }
      };

      fileTransfer.download(uri, destPath, res, rej, false);
      this.set('download', fileTransfer);

    });
    // let downloader = new BackgroundTransfer.BackgroundDownloader();
    // let onprogress = (e) => {
    //   this.set('downloadProgress', Math.ceil(100 * e.bytesReceived / e.totalBytesToReceive));
    // };

    // return this.resolveFileURL(destDir)
    //   .then(dir => this.createFile(dir, destFileName))
    //   .then(file => {
    //     let download = downloader.createDownload(uri, file);
    //     this.set('download', download);
    //     return new Ember.RSVP.Promise((res, rej) => {
    //       download.startAsync().then(res, rej, onprogress);
    //     });
    //   });
  },

  unzip(source, dest) {
    return new Ember.RSVP.Promise((resolve, reject) => window.zip.unzip(source, dest, (result) => (result < 0) ? reject() : resolve(), (e) => {
      if (e.lengthComputable) {
        this.set('zipProgress', Math.ceil(100 * e.loaded / e.total));
      } else {
        this.incrementProperty('zipProgress');
      }
    }));
  },

  resolveFileURL(url) {
    return new Ember.RSVP.Promise((res, rej) => {
      window.resolveLocalFileSystemURL(url, (file) => res(file), rej);
    });
  },

  createFile(dir, file) {
    return new Ember.RSVP.Promise((resolve) => {
      dir.getFile(file, { create: true }, resolve);
    });
  },

  getFile(dir, file) {
    return new Ember.RSVP.Promise((resolve) => {
      dir.getFile(file, resolve);
    });
  },

  moveFile(file, dest, newName) {
    return new Ember.RSVP.Promise((res) => {
      file.moveTo(dest, newName);
      res();
    });
  },

  readFolderContents(dir) {
    return new Ember.RSVP.Promise(function(res, rej) {
      let reader = dir.createReader();
      let entries = [];
      let readEntries = function() {
        reader.readEntries(function(results) {
          if (!results.length) {
            res(entries.sort());
          } else {
            entries = entries.concat(Array.prototype.slice.call(results || [], 0));
            readEntries();
          }
        }, rej);
      };
      readEntries();
    });
  },

  readFileContents(file) {
    return new Ember.RSVP.Promise(function(res, rej) {
      file.file((file) => {
        let reader = new FileReader();

        reader.onload = (e) => {
          res(e.target.result);
        };

        reader.readAsText(file);
      }, rej);
    });
  },

  writeFileContents(file, content) {
    return new Ember.RSVP.Promise((res, rej) => {
      file.createWriter((fileWriter) => {
        let blob = new Blob([content], { type: 'text/plain' });

        fileWriter.onwriteend = () => {
          res(content);
        };

        file.onerror = (e) => {
          rej(e.toString());
        };

        fileWriter.write(blob);
      });
    });
  }
});
