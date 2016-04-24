import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  primaryKey: 'permalink',
  normalizeFindAllResponse(store, primaryModelClass, payload, id, requestType) {
    payload = { sections: payload };
    return this._super(store, primaryModelClass, payload, id, requestType);
  },
  normalizeFindRecordResponse(store, primaryModelClass, payload, id, requestType) {
    payload = { section: payload };
    return this._super(store, primaryModelClass, payload, id, requestType);
  },
  normalizeQueryRecordResponse(store, primaryModelClass, payload, id, requestType) {
    payload = { section: payload };
    return this._super(store, primaryModelClass, payload, id, requestType);
  }
});
