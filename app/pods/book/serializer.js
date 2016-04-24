import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  primaryKey: 'permalink',
  normalizeFindAllResponse(store, primaryModelClass, payload, id, requestType) {
    payload = { books: payload };
    return this._super(store, primaryModelClass, payload, id, requestType);
  },
  normalizeFindRecordResponse(store, primaryModelClass, payload, id, requestType) {
    payload = { book: payload };
    return this._super(store, primaryModelClass, payload, id, requestType);
  }
});
