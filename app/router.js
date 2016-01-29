import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login', function() {
    this.route('pin', { path: '/pin/:user_id' });
  });
  this.route('register');
  this.route('course', { path: '/course/:course_id' }, function() {
    this.route('module', { path: '/module/:module_id' });
  });
  this.route('settings');
});

export default Router;
