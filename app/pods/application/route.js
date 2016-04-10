import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  session: Ember.inject.service('session'),
  beforeModel() {
    return this.store.query('course', { permalink: 'funzo-CSE-1000' }).then((courses) => {
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

          return Ember.RSVP.resolve(this.store.pushPayload(hash));

          // let modules = Ember.A(content.modules);
          // delete content.modules;

          // let course = this.store.createRecord('course', content);

          // return course.save().then(() => {
          //   modules = modules.map((module) => {
          //     module.course = course;
          //     let activities = module.activities;

          //     activities.map((activity) => {
          //       activity = this.store.createRecord('activity', activity);
          //       activity.
          //     });

          //     return this.store.createRecord('module', module);
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
