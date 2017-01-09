import Ember from 'ember';
import ENV from 'funzo-app/config/environment';

export default Ember.Service.extend({
  testMsg() {
    console.log("XAPI SERVICE");
  },
  // this used to be syncStatements(plural) so it has a useless array
  // we might want to go back to that, but for now one sync per statement
  // lets us get around our weird query issues
  syncStatement(statement) {
    /* global TinCan */
    var xapi = new TinCan(ENV.APP.xAPI);
    var xApiStatements = [];
    xApiStatements.addObject(statement);
    xapi.sendStatements(xApiStatements, (res) => {
      if (!res[0].err) {
        // XXX FIXME since we're cheating and passing statement data directly,
        // we can't sync the corresponding db method for free. we'll have to
        // query the record here and set it to synced, or find a way to make
        // this work using actual model objects from a query
        // statement.synced = true;
        // statement.save();
        Ember.RSVP.resolve(xApiStatements);
      } else {
        console.log("DBG ERROR");
      }
    });
  }
});
