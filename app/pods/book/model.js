import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  title: DS.attr('text'),
  permalink: DS.attr('text'),
  subject: DS.attr('text'),
  sections: DS.hasMany('section', { async: true })
});
