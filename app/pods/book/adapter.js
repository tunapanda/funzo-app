import DS from "ember-data";

export default DS.RESTAdapter.extend({
  urlForFindAll() {
    let url = "content/epubs/index.json";
    if (window.cordova) {
      return window.cordova.file.dataDirectory + url;
    }
    return `filesystem:http://localhost:4200/persistent/${url}`;
  },

  urlForFindRecord(permalink) {
    let url = `content/epubs/${permalink}.json`;
    if (window.cordova) {
      return window.cordova.file.dataDirectory + url;
    }
    return `filesystem:http://localhost:4200/persistent/${url}`;
  },

  urlForFindHasMany(id, modelName, snapshot) {
    this._super(id, modelName, snapshot);
  }
});
