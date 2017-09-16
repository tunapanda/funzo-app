import Ember from "ember";
import ENV from "funzo-app/config/environment";

export default Ember.Service.extend(Ember.Evented, {
  downloadProgress: 0,
  unzipProgress: 0,

  status: "idle",

  init() {
    window.zip.workerScripts = {
      deflater: ["zip/z-worker.js", "zip/zlib.js", "zip/zlib-asm/codecs.js"],
      inflater: ["zip/z-worker.js", "zip/zlib.js", "zip/zlib-asm/codecs.js"]
    };
    this.setup();
  },

  setup() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      window.requestFileSystem =
        window.requestFileSystem || window.webkitRequestFileSystem;
      if (!window.requestFileSystem) {
        reject("no access to file system");
      }
      window.navigator.webkitPersistentStorage.requestQuota(
        100 * 1024 * 1024,
        grantedBytes => {
          window.requestFileSystem(
            window.PERSISTENT,
            grantedBytes,
            fs => {
              this.fs = fs;
              this.root = fs;

              let resolveRootDir = () => {
                return new Ember.RSVP.Promise(res => {
                  if (window.cordova) {
                    window.resolveLocalFileSystemURL(
                      window.cordova.file.dataDirectory,
                      baseDir => {
                        this.root = baseDir;
                        return res();
                      }
                    );
                  } else {
                    this.root = fs.root;
                    window.root = fs.root;
                    return res();
                  }
                });
              };

              resolveRootDir()
                .then(() =>
                  Ember.RSVP.all([
                    this.createDirectory("tmp"),
                    this.createDirectory("content")
                      .then(() => this.createDirectory("content/books"))
                      .then(() => this.createDirectory("content/epubs")),
                    this.createDirectory("downloads")
                      .then(() => this.createDirectory("downloads/books"))
                      .then(() => this.createDirectory("downloads/epubs"))
                  ])
                )
                .catch(errs => console.log(errs));
            },
            function(e) {
              console.log("Error", e);
            }
          );
        }
      );
    });
  },

  reset() {
    this.setProperties({
      status: "idle",
      downloadProgress: 0,
      unzipProgress: 0,
      download: null,
      code: ""
    });
  },

  addBook(code) {
    this.set("status", "downloading");
    return this.downloadBook(code)
      .then(() => {
        this.set("status", "unzipping");
        return this.unzipBook(code);
      })
      .then(() => this.updateIndex())
      .then(
        () => {
          // this.set('status', 'complete');
          this.reset();
        },
        err => {
          this.set("status", "error");
          this.set("error", err);
        }
      );
  },

  addEPUB(code) {
    this.set("status", "downloading");
    return this.downloadEPUB(code)
      .then(() => {
        this.set("status", "unzipping");
        return this.unzipEPUB(code);
      })
      .then(() => this.updateIndex())
      .then(
        () => {
          // this.set('status', 'complete');
          this.reset();
        },
        err => {
          this.set("status", "error");
          this.set("error", err);
        }
      );
  },

  addEPUBFromFile: async function(file) {
    this.set("status", "downloading");
    let code = Math.random()
      .toString(36)
      .substring(7);

    await new Ember.RSVP.Promise((resolve, reject) => {
      let ZIPFS = new window.zip.fs.FS();

      ZIPFS.importBlob(file, () =>
        this.root.getDirectory(`content/epubs/${code}`, { create: true }, dir =>
          ZIPFS.root.getFileEntry(dir, resolve, null, reject)
        )
      );
    });

    return this.updateIndex().then(() => this.reset());
  },

  deleteBook(id) {
    this.removeDirectory(`content/books/${id}`).then(() => this.updateIndex());
  },

  updateIndex: async function() {
    const bookDir = await this.getDirectory("content/epubs");
    const bookFolders = await this.readFolderContents(bookDir);

    const bookXMLs = await Ember.RSVP.all(
      bookFolders.filterBy("isDirectory", true).map(bookFolder => {
        return this.getFile(
          `content/epubs/${bookFolder.name}/OEBPS/content.opf`
        ).then(file => this.readFileContents(file));
      })
    );

    const bookMetas = bookXMLs.map((bookXML, index) => {
      let parser = new DOMParser();
      let bookDOM = parser.parseFromString(bookXML, "text/xml");
      window.$BOOK = bookDOM;

      let json = {
        title: bookDOM.getElementsByTagName("dc:title")[0].innerHTML,
        permalink: `content/epubs/${bookFolders[index].name}`,
        institution: bookDOM.getElementsByTagName("dc:creator")[0].innerHTML,
        coverLocation: bookDOM.querySelector('meta[name="cover"]').getAttribute('content')
      };
      console.log(json);
      return JSON.stringify(json);
    });

    let indexContent = `[${bookMetas.join(",")}]`;

    let content = await this.createFile(bookDir, "index.json").then(indexFile =>
      this.writeFileContents(indexFile, indexContent)
    );

    let json = JSON.parse(content);
    this.trigger("booksUpdated", json);

    return Ember.RSVP.resolve(json);
  },

  /**
   * Get the url from a code
   *
   * @param code {String}
   * @return {String} the url
   **/

  urlForBook(code) {
    if (code === "demo" || code === "demo-ndl") {
      return "https://www.dropbox.com/s/tbfvbbotoaxp4m5/demo.zip?dl=1";
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
    if (code === "demo-ndl") {
      return Ember.RSVP.resolve();
    }
    return this.fileTransfer(url, `downloads/books/${code}.zip`);
  },

  /**
   * Start download of a book
   *
   * @param code {String}
   * @return {Promise}
   **/

  downloadEPUB(code) {
    let url = this.urlForBook(code);
    console.log("Downloading " + url);
    if (code === "demo-ndl") {
      return Ember.RSVP.resolve();
    }
    return this.fileTransfer(url, `downloads/epubs/${code}.zip`);
  },

  /**
   * Unzip the book
   * unzip to a tmp location
   * read permalink
   * move to books/permalink
   **/
  unzipBook(code) {
    let zipPath = `downloads/books/${code}.zip`;
    let unzipDest = `tmp/${code}`;
    return this.createDirectory("tmp/" + code)
      .then(() => this.unzip(zipPath, unzipDest))
      .then(() => this.getFile(`tmp/${code}/book.json`))
      .then(file => this.readFileContents(file))
      .then(bookJSON => {
        let bookMeta = JSON.parse(bookJSON);
        let permalink = bookMeta.permalink;

        return Ember.RSVP
          .hash({
            destFolder: this.getDirectory("content/books"),
            unzipFolder: this.getDirectory(`tmp/${code}`)
          })
          .then(res => {
            return this.moveFile(res.unzipFolder, res.destFolder, permalink);
          });
      });
  },

  /**
 * Unzip the book
 * unzip to a tmp location
 * read permalink
 * move to books/permalink
 **/
  unzipEPUB(code) {
    let zipPath = `downloads/epubs/${code}.zip`;
    let unzipDest = `tmp/${code}`;
    return this.createDirectory("tmp/" + code)
      .then(() => this.unzip(zipPath, unzipDest))
      .then(() => this.getFile(`tmp/${code}/book.json`))
      .then(file => this.readFileContents(file))
      .then(bookJSON => {
        let bookMeta = JSON.parse(bookJSON);
        let permalink = bookMeta.permalink;

        return Ember.RSVP
          .hash({
            destFolder: this.getDirectory("content/epubs"),
            unzipFolder: this.getDirectory(`tmp/${code}`)
          })
          .then(res => {
            return this.moveFile(res.unzipFolder, res.destFolder, permalink);
          });
      });
  },

  createDirectory(folder) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.root.getDirectory(
        folder,
        { create: true },
        file => {
          if (file) {
            return resolve(file);
          }
          return reject(`could not create directory ${folder}`);
        },
        reject
      );
    });
  },

  removeDirectory(folder) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.root.getDirectory(
        folder,
        {},
        file => {
          if (file) {
            file.removeRecursively(resolve, reject);
          }
        },
        reject
      );
    });
  },

  fileTransfer(uri, destPath) {
    return new Ember.RSVP.Promise((res, rej) => {
      let fileTransfer = new window.FileTransfer();
      uri = encodeURI(uri);

      fileTransfer.onprogress = e => {
        if (e.lengthComputable) {
          this.set("downloadProgress", Math.ceil(100 * e.loaded / e.total));
        } else {
          this.incrementProperty("downloadProgress");
        }
      };

      fileTransfer.download(uri, this.root.toURL() + destPath, res, rej, false);
      this.set("download", fileTransfer);
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
    return new Ember.RSVP.Promise((resolve, reject) => {
      if (!window.zip) reject("no window.zip");

      let ZIPFS = new window.zip.fs.FS();

      ZIPFS.importBlob(file, () => {
        fs.root.getDirectory("tmp", { create: false }, dir => {
          ZIPFS.root.getFileEntry(dir, () => {
            console.log("success");
          });
        });
      });

      let FS = new window.zip.fs.FS();

      this.resolveFileURL(source).then(file => {
        console.log(file);
      });

      // window.zip.fs(
      //   source,
      //   dest,
      //   result => {
      //     if (result < 0) {
      //       window.alert("Unzip Error");
      //       return reject();
      //     }
      //     return resolve();
      //   },
      //   e => {
      //     if (e.lengthComputable) {
      //       this.set("zipProgress", Math.ceil(100 * e.loaded / e.total));
      //     } else {
      //       this.incrementProperty("zipProgress");
      //     }
      //   }
      // );
    });
  },

  resolveFileURL(url) {
    return new Ember.RSVP.Promise((res, rej) => {
      this.root.getFile(url, { create: false }, file => res(file), rej);
    });
  },

  createFile(dir, file) {
    return new Ember.RSVP.Promise(resolve => {
      dir.getFile(file, { create: true }, resolve);
    });
  },

  getFile(url) {
    return new Ember.RSVP.Promise((res, rej) => {
      this.root.getFile(url, { create: false }, file => res(file), rej);
    });
  },

  getDirectory(url) {
    return new Ember.RSVP.Promise((res, rej) => {
      this.root.getDirectory(url, { create: false }, file => res(file), rej);
    });
  },

  moveFile(file, dest, newName) {
    return new Ember.RSVP.Promise(res => {
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
            entries = entries.concat(
              Array.prototype.slice.call(results || [], 0)
            );
            readEntries();
          }
        }, rej);
      };
      readEntries();
    });
  },

  readFileContents(file) {
    return new Ember.RSVP.Promise(function(res, rej) {
      file.file(file => {
        let reader = new FileReader();

        reader.onload = e => {
          res(e.target.result);
        };

        reader.readAsText(file);
      }, rej);
    });
  },

  writeFileContents(file, content) {
    return new Ember.RSVP.Promise((res, rej) => {
      file.createWriter(fileWriter => {
        let blob = new Blob([content], { type: "text/plain" });

        fileWriter.onwriteend = () => {
          res(content);
        };

        file.onerror = e => {
          rej(e.toString());
        };

        fileWriter.write(blob);
      });
    });
  },

  writeEPUB(file, content) {
    return new Ember.RSVP.Promise((res, rej) => {
      file.createWriter(fileWriter => {
        let blob = new Blob([content], { type: "application/zip" });

        fileWriter.onwriteend = () => {
          res(content);
        };

        file.onerror = e => {
          rej(e.toString());
        };

        fileWriter.write(blob);
      });
    });
  }
});
