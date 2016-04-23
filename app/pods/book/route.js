import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
  	  var url = '/content/book/${params.book_id}/book.json';
  	  return Ember.RSVP.Promise((resolve,reject) => {
  	  	Ember.$.getJSON(url, function(content,status) { resolve(content) } )
  	  }).then(function(book) {
  	  	var sections = book.sections.map(function(s) {
  	  		return s.id;
  	  	});
  	  	delete book.sections;
		return book;
  	  });
  }
});
