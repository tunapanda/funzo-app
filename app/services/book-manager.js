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
        grantedBytes =>
          window.requestFileSystem(window.PERSISTENT, grantedBytes, fs => {
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
              .then(resolve, reject);
          })
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
    this.removeDirectory(`content/epub/${id}`).then(() => this.updateIndex());
  },

  deleteAll: async function() {
    const bookFolders = await this.readFolderContents(
      await this.getDirectory("content/epubs")
    );

    await Ember.RSVP.all(
      bookFolders.map(folder => {
        if (folder.isDirectory) {
          return new Ember.RSVP.Promise((res, rej) =>
            folder.removeRecursively(res, rej)
          );
        }
        return Ember.RSVP.resolve();
      })
    );

    this.updateIndex();
  },

  updateIndex: async function() {
    const bookDir = await this.getDirectory("content/epubs");
    const bookFolders = await this.readFolderContents(bookDir);

    const bookMetas = await Ember.RSVP.all(
      bookFolders.filterBy("isDirectory", true).map(async bookFolder => {
        const containerFile = await this.getFile(
          `content/epubs/${bookFolder.name}/META-INF/container.xml`
        ).then(file => this.readFileContents(file));

        let parser = new DOMParser();
        let container = parser.parseFromString(containerFile, "text/xml");

        const contentFileName = container
          .getElementsByTagName("rootfile")[0]
          .getAttribute("full-path");

        const contentFileLocation = contentFileName
          .split("/")
          .slice(0, -1)
          .join("/") + "/";

        const bookXML = await this.getFile(
          `content/epubs/${bookFolder.name}/${contentFileName}`
        ).then(file => this.readFileContents(file));

        let bookDOM = parser.parseFromString(bookXML, "text/xml");

        let json = {
          title: bookDOM.getElementsByTagName("dc:title")[0].innerHTML,
          permalink: bookFolder.name,
          institution: bookDOM.getElementsByTagName("dc:creator")[0].innerHTML,
          coverLocation:
            contentFileLocation +
            bookDOM
              .getElementById(
                bookDOM
                  .querySelector('meta[name="cover"]')
                  .getAttribute("content")
              )
              .getAttribute("href")
        };
        console.log(json);

        return json;
      })
    );

    let indexContent = JSON.stringify(bookMetas);

    let content = await this.createFile(bookDir, "index.json").then(indexFile =>
      this.writeFileContents(indexFile, indexContent)
    );

    await  Ember.RSVP.all(bookMetas.map(async (bookMeta) => {
      await this.createFile(bookDir, `${bookMeta.permalink}.json`).then(file =>
        this.writeFileContents(file, JSON.stringify(bookMeta))
      );
    }))

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

  downloadEPUB(code) {
    let url = this.urlForBook(code);
    console.log("Downloading " + url);
    if (code === "demo-ndl") {
      return Ember.RSVP.resolve();
    }
    return this.fileTransfer(url, `downloads/epubs/${code}.zip`);
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
