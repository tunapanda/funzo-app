// Create a copy of this file called `local.js` and customize it
module.exports = {
  update_env: function(env) {
    // The key used to encrypt your book content. This can be
    // any string, but must match the key specified in the
    // book.json for your book, or the app will not be able
    // to read it. 
    env.encryptionKeyBase = 'abc123';
    // URL of the location from which books can be downloaded
		env.bookURLBase = 'http://example.com/books';
    // Authentication information for an xAPI learning record
    // store (e.g. LearningLocker) to which the app can send 
    // activity reports. 
		env.xAPI.recordStores = [{
      endpoint: 'https://example.com/lrs',
			username: 'XXXX',
			password: 'YYYY',
			allowFail: false
		}];
		// Number of decimal places to get from lat/long values
		// 3 decimal places = accuracy to ~ 100 meters
		// 2 would be closer to ~ 1km
		// More details: http://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude
		// -1 disables location data in xapi reports
		env.xAPI.gps_accuracy: 3
    return env;
  }
}
