// import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  title: DS.attr(),
  permalink: DS.attr(),
  subject: DS.attr(),
  modules: DS.hasMany('module', { async: true })
});
