import Ember from 'ember';
import NavBarTitleMixin from 'funzo-app/mixins/nav-title';

export default Ember.Route.extend(NavBarTitleMixin, {
  showBackButton: true,
  afterModel(model) {
    this.set('navBarTitle', model.get('title'));
    return this._super(...arguments);
  }
  // model(params) {
  //   return this.modelFor('course.module').get('activities').findBy('permalink', params.activity_permalink);
  // },

  // serialize: function(model) {
  //   // this will make the URL `/posts/12`
  //   return { activity_permalink: model.permalink };
  // }
});
