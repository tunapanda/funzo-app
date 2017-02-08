import Ember from 'ember';

export default Ember.Service.extend({
  currentUser: Ember.inject.service('current-user'),
  user: null,
  book: null,

  currentPosition: Ember.computed('book', 'user.currentPage', function() {
    console.group('calculating current position for ' + this.get('user.username') + '.' + this.get('propName'));
    let pos = this.get('user.' + this.get('propName'));
    let result = null;
    console.log('Starting position:', pos, 'type:', typeof pos);
    if (typeof pos === 'undefined' || Number.isNaN(pos)) {
      console.log('no such pos');
      result = 0;
    } else {
      console.log('okay');
      result = pos;
    }
    console.log('returning', result);
    console.groupEnd();
    return result;
  }),

  propName: Ember.computed('book', function() {
    return 'currentPage'; // + '.' + this.get('book.permalink');
  }),

  // make sure we have the current user before doing anything else
  start() {
    return this.get('currentUser.model').then((user) => {
      console.log('bookmarks got current user', user.get('username'));
      this.set('user', user);
    });
  },

  openBook(book) {
    console.log('bookmarks opened book', book.get('permalink'));
    this.set('book', book);
  },

  updatePosition(scrollLeft) {
    console.group('Updating user bookmark');
    console.log('scroll: ', scrollLeft);
    console.log('user: ', this.user.get('username'));
    console.log('propName:', this.get('propName'));
    console.groupEnd();
    this.user.set(this.get('propName'), scrollLeft);
    this.user.save();
  }
});

