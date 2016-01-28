import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';


export default Ember.Route.extend(ApplicationRouteMixin, {
  session: Ember.inject.service('session'),
  beforeModel() {
    return this.store.findAll('course').then((courses) => {
      if(!courses.findBy('permalink', 'funzo-CSE-1000')) {
        return new Ember.RSVP.Promise((resolve, reject) => Ember.$.getJSON('/courses/funzo-cse-1000/content.json', (content, status) => {
          if (status!=='success') return reject(status);

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
            course.set('modules', modules);
            course.save();
          });
          
          
        }));
      }
      return Ember.RSVP.resolve();
    });
  },

  actions: {
    back: function() {
      history.back();
    },

    openLink: function(url) {
      window.open(url, '_system');
    }
  }
});
