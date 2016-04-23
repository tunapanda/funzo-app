import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

var update_courses = function(app) {
  return app.store.query('course', { permalink: 'funzo-CSE-1000' }).then((courses) => {
      if (!courses.get('length')) {
        return new Ember.RSVP.Promise((resolve, reject) => Ember.$.getJSON('courses/funzo-CSE-1000/content.json', (content, status) => {
          if (status !== 'success') {
            return reject(status);
          }
          return resolve(content);
        }).then((content) => {
          let modules = content.modules;
          delete content.modules;

          let modulePermalinks = modules.map((module) => module.permalink);

          let activitys = [];

          modules.forEach((module) => {
            if (module.activities) {
              activitys.push(...module.activities);
              let activityPermalinks = module.activities.map((activity) => activity.permalink);
              module.activities = activityPermalinks;
            } else {
              module.activities = [];
            }
          });

          let course = content;

          course.modules = modulePermalinks;

          let hash = {
            course,
            modules,
            activitys
          };

          return Ember.RSVP.resolve(app.store.pushPayload(hash));

          // let modules = Ember.A(content.modules);
          // delete content.modules;

          // let course = app.store.createRecord('course', content);

          // return course.save().then(() => {
          //   modules = modules.map((module) => {
          //     module.course = course;
          //     let activities = module.activities;

          //     activities.map((activity) => {
          //       activity = app.store.createRecord('activity', activity);
          //       activity.
          //     });

          //     return app.store.createRecord('module', module);
          //   });

          //   return Ember.RSVP.all(modules.invoke('save'));
          // }).then((modules) => {
          //   course.get('modules').pushObjects(modules);
          //   return course.save();
          // });
        }));
      }
      return Ember.RSVP.resolve();
    });
};

var update_books = function(app) {
  console.log("Updating books...");
  return new Ember.RSVP.Promise((resolve, reject) =>
    Ember.$.getJSON('books/local_books.json', function(content,status) {
      if (status !== 'success') {
        console.log("REEEEJECTED!  " + status);
        return reject(status);
      }
      return resolve(content);
      console.log("contents!");
      console.log(content);
      console.log(content.constructor.name);
      var db_content = [];
      content.forEach(function(book) {
        // check whether an entry with app
        // permalink is in the DB, and add one if not
        console.log("Boo0ook!: " + book.title);
        console.log(book);
        var sections = book.sections;
        delete book.sections;
        app.store.query('book', { permalink: book.permalink }).then((books) => {
            console.log("Query returned " + books);
            console.log(books);
          if (!books.get('length')) {
            if (typeof(db_content.get("book")) === "undefined") {
              db_content["book"] = [];   
            }
            db_content.concat(book);
          }
        });
        sections.forEach(function(section) {
            app.store.query('section', { permalink: section.permalink }).then((sections) => {
              if (!sections.get('length')) {
                if (typeof(db_content.get("section")) === "undefined") {
                  db_content["section"] = [];    
                }
                db_content["section"].concat(section);
              }
            });
        });
        console.log("DBC");
        console.log(db_content);
        app.store.pushPayload(db_content);
      });
    })
  );
};

export default Ember.Route.extend(ApplicationRouteMixin, {
  session: Ember.inject.service('session'),
  beforeModel() {
    var res = Ember.RSVP.hash({
       //update_books: update_books(this),
       update_courses: update_courses(this)
    });
    return res;
  },

  actions: {
    back() {
      history.back();
    },

    openLink(url) {
      window.open(url, '_system');
    }
  }
});
