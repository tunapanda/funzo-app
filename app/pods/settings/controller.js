import Ember from 'ember';

function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

// Call the reader.readEntries() until no more results are returned.
function readFolder(dir) {
  return new Ember.RSVP.Promise(function(res, rej) {
    let reader = dir.createReader();
    let entries = [];
    let readEntries = function() {
      reader.readEntries(function(results) {
        if (!results.length) {
          res(entries.sort());
        } else {
          entries = entries.concat(toArray(results));
          readEntries();
        }
      }, rej);
    };
    readEntries();
  });
}

function createDirectory(dest, folder) {
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
}

function loadCourse(coursesPath, name, store) {
  return store.query('course', { permalink: name }).then((courses) => {
    if (!courses.get('length')) {
      return new Ember.RSVP.Promise((resolve, reject) => Ember.$.getJSON(`${coursesPath}${name}/content.json`, (content, status) => {
        if (status !== 'success') {
          return reject(status);
        }
        return resolve(content);
      }).then((content) => {
        let modules = Ember.A(content.modules);
        delete content.modules;
        content.location = coursesPath;
        let course = store.createRecord('course', content);

        return course.save().then(() => {
          modules = modules.map((module) => {
            module.course = course;
            return store.createRecord('module', module);
          });

          return Ember.RSVP.all(modules.invoke('save'));
        }).then((modules) => {
          course.get('modules').pushObjects(modules);
          return course.save();
        });
      }));
    }
    console.log('course \'%s\' already loaded', name);
    return Ember.RSVP.resolve();
  });
}

export default Ember.Controller.extend({
  init() {
    if (window.cordova) {
      if (window.cordova.file.externalRootDirectory) {
        this.set('SDCourseDirectory', `${window.cordova.file.externalRootDirectory}FUNZO/courses/`);
      }
      this.set('internalCourseDirectory', `${window.cordova.file.dataDirectory}courses/`);
      createDirectory(window.cordova.file.dataDirectory, `courses`);
    }
    return this._super(...arguments);
  },

  courseUrl: 'https://github.com/tunapanda/funzo-CSE-1000/archive/master.zip',
  currentUser: Ember.inject.service('currentUser'),
  modal: Ember.inject.service('bootstrap-modal'),

  statementCount: Ember.computed.alias('model.statements.length'),

  unsyncedStatements: Ember.computed.filterBy('model.statements', 'synced', false),

  unsyncedStatementCount: Ember.computed.alias('unsyncedStatements.length'),

  syncable: Ember.computed.bool('unsyncedStatementCount'),

  actions: {
    addCourse() {
      this.set('modal.component', 'add-course');

      Ember.$('.modal').modal('show');
    },
    syncStatements() {
      console.log("DBG syncing...");
      let statements = this.get('unsyncedStatements').map((statement) => statement.get('content'));

      this.get('xAPI').sendStatements(statements, (res) => {
        if (!res[0].err) {
          let unsynced = this.get('unsyncedStatements');
          unsynced.setEach('synced', true);
          unsynced.invoke('save');
        }
      });
    },
    deleteAllCourse() {
      this.store.findAll('course').then((courses) => {
        courses.invoke('destroyRecord');
        this.store.findAll('module').then((modules) => modules.invoke('destroyRecord'));
      });
    },
    deleteAllStatements() {
      this.store.findAll('x-api-statement').then((statements) => statements.invoke('destroyRecord'));
    },
    loadSDCourses() {
      if (!window.cordova) {
        return alert('only works in app');
      }

      return new Ember.RSVP.Promise((resolve, reject) => {
        console.log('loading courses from %s', this.get('SDCourseDirectory'));
        window.resolveLocalFileSystemURL(this.get('SDCourseDirectory'), resolve, reject);
      })
      .then((dir) => readFolder(dir))
      .then((fileList => {
        fileList.forEach((course) => this.loadCourse(course));
      })).catch((err) => {
        console.log(err);
        if (err.code === 1) {
          alert('SD /FUNZO/courses directory does not exist');
        }
      });
    },
    importSDCourses() {
      if (!window.cordova) {
        return alert('only works in app');
      }

      return new Ember.RSVP.Promise((resolve, reject) => window.resolveLocalFileSystemURL(this.get('SDCourseDirectory'), resolve, reject))
      .then((dir) => Ember.RSVP.hash({
        fileList: readFolder(dir),
        dest: new Ember.RSVP.Promise((resolve, reject) => window.resolveLocalFileSystemURL(this.get('internalCourseDirectory'), resolve, reject))
      }))
      .then(result => {
        return Ember.RSVP.all(result.fileList.map((course) => {
          return new Ember.RSVP.Promise((resolve, reject) => course.copyTo(result.dest, null, resolve, (err) => err.code === 9 ? resolve() : reject()));
        }));
      })
      .then((fileList => {
        fileList.forEach((course) => course && this.loadCourse(course));
      }))
      .catch((err) => {
        console.log(err);
        if (err.code === 1) {
          alert('SD /FUNZO/courses directory does not exist');
        }
      });
    }
  },

  loadCourse(courseDir) {
    return loadCourse(this.get('SDCourseDirectory'), courseDir.name, this.store);
  }
});
