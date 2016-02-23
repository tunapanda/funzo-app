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
          let modules = Ember.A(content.modules);
          delete content.modules;

          let course = this.store.createRecord('course', content);

          return course.save().then(() => {
            modules = modules.map((module) => {
              module.course = course;
              return this.store.createRecord('module', module);
            });

            return Ember.RSVP.all(modules.invoke('save'));
          }).then((modules) => {
            course.get('modules').pushObjects(modules);
            return course.save();
          });
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
