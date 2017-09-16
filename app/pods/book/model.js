import Ember from "ember";
import DS from "ember-data";
import { Model } from "ember-pouch";

export default Model.extend({
  permalink: DS.attr(),
  title: DS.attr(),
  author: DS.attr(),
  institution: DS.attr(),
  institutionUri: DS.attr(),
  subject: DS.attr(),
  type: DS.attr({ defaultValue: "tepup" }), // TEPUB - Tunapanda EPUB
  sections: DS.hasMany("section", { async: true }),
  cover: Ember.computed("coverLocation", function() {
    return `filesystem:http://localhost:4200/persistent/${this.get("id")}/OEBPS/image/${this.get("coverLocation")}`;
    // return window.cordova ? window.cordova.file.dataDirectory + 'content/books/' + this.get('id') + '/cover.png' : 'content/books/' + this.get('id') + '/cover.png';
  }),
  coverLocation: DS.attr(),
  location: Ember.computed("id", function() {
    return `filesystem:http://localhost:4200/persistent/${this.get("id")}/`;
  })
  // cover: DS.attr()
});
