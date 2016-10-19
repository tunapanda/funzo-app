import Ember from 'ember';
import ENV from 'funzo-app/config/environment';

export default Ember.Service.extend(Ember.Evented, {
  downloadProgress: 0,
  unzipProgress: 0,

  status: 'idle',

  init() {
    this.setup();
  },

  setup() {
    return new Ember.RSVP.Promise((resolve) => {
      window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
      window.requestFileSystem(window.PERSISTENT, 0, (fs) => {
        this.fs = fs;
        this.root = fs;

        resolve(new Ember.RSVP.Promise((res) => window.cordova && window.resolveLocalFileSystemURL(window.cordova.file.dataDirectory, (baseDir) => {
          this.root = baseDir;
          return res();
        })).then(() => Ember.RSVP.all([
          this.createDirectory('tmp'),
          this.createDirectory('content')
            .then(() => this.createDirectory('content/books')),
          this.createDirectory('downloads')
            .then(() => this.createDirectory('downloads/books'))
        ])));
      });
    });
  },

  reset() {
    this.setProperties({
      status: 'idle',
      downloadProgress: 0,
      unzipProgress: 0,
      download: null,
      code: ""
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
        //this.set('status', 'complete');
        this.reset();
      }, (err) => {
        this.set('status', 'error');
        this.set('error', err);
      });
  },

  deleteBook(id) {
    this.removeDirectory(`content/books/${id}`)
      .then(() => this.updateIndex());
  },

  updateIndex() {
    return this.getDirectory('content/books')
      .then((bookDir) => {
        return this.readFolderContents(bookDir)
        .then((bookFolders) => {
          return Ember.RSVP.all(bookFolders.filterBy('isDirectory', true).map((bookFolder) => {
            return this.getFile(`content/books/${bookFolder.name}/book.json`).then(file => this.readFileContents(file));
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
    console.log("Downloading " + url);
    if (code === 'demo-ndl') {
      return Ember.RSVP.resolve();
    }
    return this.fileTransfer(url, `downloads/books/${code}.zip`);
  },

  /**
   * Unzip the book
   * unzip to a tmp location
   * read permalink
   * move to books/permalink
   **/
  unzipBook(code) {
    let zipPath = `${this.root.toURL()}downloads/books/${code}.zip`;
    let unzipDest = `${this.root.toURL()}tmp/${code}`;
    return this.createDirectory('tmp/' + code)
      .then(() => this.unzip(zipPath, unzipDest))
      .then(() => this.getFile(`tmp/${code}/book.json`))
      .then((file) => this.readFileContents(file))
      .then((bookJSON) => {
        let bookMeta = JSON.parse(bookJSON);
        let permalink = bookMeta.permalink;

        return Ember.RSVP.hash({
          destFolder: this.getDirectory('content/books'),
          unzipFolder: this.getDirectory(`tmp/${code}`)
        }).then((res) => {
          return this.moveFile(res.unzipFolder, res.destFolder, permalink);
        });
      });
  },

  createDirectory(folder) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.root.getDirectory(folder, { create: true }, (file) => {
        if (file) {
          return resolve(file);
        }
        return reject(`could not create directory ${folder}`);
      }, reject);
    });
  },

  removeDirectory(folder) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.root.getDirectory(folder, {}, (file) => {
        if (file) {
          file.removeRecursively(resolve, reject);
        }
      }, reject);
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

      fileTransfer.download(uri, this.root.toURL() + destPath, res, rej, false);
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
      this.root.getFile(url, { create: false }, (file) => res(file), rej);
    });
  },

  createFile(dir, file) {
    return new Ember.RSVP.Promise((resolve) => {
      dir.getFile(file, { create: true }, resolve);
    });
  },

  getFile(url) {
    return new Ember.RSVP.Promise((res, rej) => {
      this.root.getFile(url, { create: false }, (file) => res(file), rej);
    });
  },

  getDirectory(url) {
    return new Ember.RSVP.Promise((res, rej) => {
      this.root.getDirectory(url, { create: false }, (file) => res(file), rej);
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
