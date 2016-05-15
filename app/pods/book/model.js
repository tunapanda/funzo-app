import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  title: DS.attr(),
  subject: DS.attr(),
  sections: DS.hasMany('section', { async: true })
});
