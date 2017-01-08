import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  primaryKey: 'permalink',
  modelNameFromPayloadKey(key) {
    if (key === "xApiStatements") {
      return "x-api-statement";
    } else {
      return key;
    }
  }
  // normalize(model, hash, prop) {
  //   if (!hash.id && prop === 'courses') {
  //     let modules = hash.modules;
  //     delete hash.modules;

  //     let modulePermalinks = modules.map((module) => module.permalink);

  //     let activities = [];

  //     modules.forEach((module) => {
  //       activities.push(module.activities);
  //       let activityPermalinks = activities.map((activity) => activity.permalink);
  //       module.activities = activityPermalinks;
  //     });

  //     let course = hash;

  //     course.modules = modulePermalinks;

  //     hash = {
  //       course,
  //       modules,
  //       activities
  //     };
  //   }
  //   return this._super(model, hash, prop);
  // }
});
