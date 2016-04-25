import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  primaryKey: 'permalink',
  normalizeFindAllResponse(store, primaryModelClass, payload, id, requestType) {
    payload = { courses: payload, modules: [], activities: [] };

    payload.courses.forEach(course => {
      let modules = course.modules;
      course.modules = modules.map(module => module.permalink);
      payload.modules.push.apply(payload.modules, modules);

      modules.forEach(module => {
        if (!module.activities) {
          return;
        }
        let activities = module.activities;
        module.activities = activities.map(module => module.permalink);
        payload.activities.push.apply(payload.activities, activities);
      });
    });

    return this._super(store, primaryModelClass, payload, id, requestType);
  },

  normalizeFindRecordResponse(store, primaryModelClass, payload, id, requestType) {
    let course = payload;
    payload = { course: payload, modules: [], activities: [] };

    let modules = course.modules;
    course.modules = modules.map(module => module.permalink);
    payload.modules.push.apply(payload.modules, modules);

    modules.forEach(module => {
      if (!module.activities) {
        return;
      }
      let activities = module.activities;
      module.activities = activities.map(module => module.permalink);
      payload.activities.push.apply(payload.activities, activities);
    });

    return this._super(store, primaryModelClass, payload, id, requestType);
  }
});