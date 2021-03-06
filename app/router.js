import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login');
  this.route('register');
  this.route('course', { path: '/course/:course_id' }, function() {
    this.route('module', { path: '/module/:module_id' }, function() {
      this.route('activity', { path: '/activity/:activity_id' });
    });
  });
  this.route('settings');
  this.route('profile');

  this.route('book', { path: '/book/:book_id' }, function() {
    this.route('section', { path: '/section/:section_id' });
  });
});

export default Router;
