import Ember from 'ember';

export default Ember.Component.extend({
  pages: [],

  finishedPaginating: false,

  didInsertElement() {

    if (this.get('paginated') !== true) {
      return this.paginate().then(() => this.setupCarousel());
    }
    this.setupCarousel();
  },

  didUpdate() {
    // HACK because component is rerendered twice, once with empty html, and a
    // page from the previous render is left FOR SOME WEIRD REASON. Then is
    // rendered again with the html from the next section.
    if (this.get('html').string.length === 0) {
      // clear out the page left behind for some reason
      return this.$('.book-content').html('');
    }
    // apparently ember forgets theres some html to be rendered now
    this.$('.book-content').html(this.get('html').string);
    this.resetCarousel();
    this.paginate().then(() => this.resetCarousel());
  },

  willClearRender() {
    this.$('.book-content').html('');
  },

  paginate() {
    return new Ember.RSVP.Promise((resolve) => {
      let container = this.$('.book-content');

      let lastPage = this.$('.book-content .page:last-child .page-content');
      let nextPage = true;

      if (lastPage.length > 0 && lastPage.height() > lastPage.parent().height()) {
        let i = 0;
        while (nextPage && i < 150) {
          nextPage = this.splitPage(lastPage);
          container.append(nextPage);
          lastPage = nextPage && nextPage.find('.page-content');
          i++;
        }
        resolve();
      }
    });
  },

  splitPage(page) {
    let toMove = [];
    let count = 0;
    page.children().each((i, p) => {
      let $p = Ember.$(p);
      if ($p.position().top + $p.height() > ($p.parent().parent().height() + 28 + 7)) {
        if (count === 0 && $p[0].tagName === 'P' && !$p.find('img').length) {
          let $p2 = $p.clone();
          toMove.push($p2);

          $p.addClass('overflow');
          $p.wrapInner('<div class="overflow-content"></div>');

          $p2.addClass('overflow');
          $p2.wrapInner('<div class="overflow-content"></div>');

          let space = $p.parent().parent().height() - $p.position().top + 28 + 7;
          let lines = Math.round(space / $p.css('lineHeight').split('px')[0]);

          $p.height(space);

          $p2.find('.overflow-content').css('marginTop', `-${lines * 24}px`);
        } else {
          toMove.push($p);
        }
        count++;
      }
    });

    let newPage = Ember.$('<div class="page"></div>').append(Ember.$('<div class="page-content"></div>').append(toMove));

    return toMove.length ? newPage : false;
  },

  setupCarousel() {
    let pagesPerScreen = 2;
    let pages = this.$('.page');
    this.$('.book-content').css('marginLeft', 0);
    this.$('.book-content').css('width', pages.length * 100 + '%');

    pages.css('width', 100 / pages.length / pagesPerScreen + '%');

    this.set('pageCount', pages.length);
    this.set('pageIndex', 0);

    this.$('.page:even').on('click', this.slidePrev.bind(this));
    this.$('.page:odd').on('click', this.slideNext.bind(this));
  },

  resetCarousel() {
    let pagesPerScreen = 2;
    let pages = this.$('.page');
    this.$('.book-content').css('marginLeft', 0);
    this.$('.book-content').css('width', pages.length * 100 + '%');

    pages.css('width', 100 / pages.length / pagesPerScreen + '%');

    this.set('pageCount', pages.length);
    this.set('pageIndex', 0);

    this.$('.page:even').on('click', this.slidePrev.bind(this));
    this.$('.page:odd').on('click', this.slideNext.bind(this));
  },

  slidePrev() {
    if (this.get('pageIndex') > 0) {
      let index = this.incrementProperty('pageIndex', -1);
      this.$('.book-content').css('marginLeft', -102 * index + '%');
    }
    this.sendAction('prevSection');
  },

  slideNext() {
    if (this.get('pageIndex') < (this.get('pageCount') / 2) - 1) {
      let index = this.incrementProperty('pageIndex', 1);
      return this.$('.book-content').css('marginLeft', -102 * index + '%');
    }
    this.sendAction('nextSection');
  }

  // paginated: Ember.computed('html', function() {

  // })
});
