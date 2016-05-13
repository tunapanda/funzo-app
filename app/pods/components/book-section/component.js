import Ember from 'ember';

// TODO
// * Subsection links (was done but lost the code)
// * rerender on resize/orientation change
// * nicer section transitions (make seamless)

export default Ember.Component.extend({
  pages: [''],
  pageIndex: 0,
  pagesPerScreen: Ember.computed(function() {
    if (window.innerHeight > window.innerWidth) {
      return 1;
    }
    return 2;
  }),
  touchStarted: false,

  pageRenderChain: Ember.RSVP.resolve(),

  pageCount: Ember.computed.alias('pages.length'),

  bookContentWidth: Ember.computed('pageCount', function() {
    return this.get('pageCount') * 100;
  }),

  carouselOffset: Ember.computed('pageIndex', 'touchMarginModifier', function() {
    return -100 * (this.get('pageIndex') / this.get('pagesPerScreen'));
  }),

  bookContentStyle: Ember.computed('bookContentWidth', 'carouselOffset', function() {
    return Ember.String.htmlSafe(`width:${this.get('bookContentWidth')}%;margin-left:${this.get('carouselOffset')}%`);
  }),

  paginatorStyle: Ember.computed('bookContentWidth', function() {
    return Ember.String.htmlSafe(`width:${this.get('bookContentWidth')}%;`);
  }),

  pageStyle: Ember.computed('containerWidth', 'pageCount', 'pagesPerScreen', function() {
    let width = this.get('containerWidth') / this.get('pagesPerScreen'); // - (20 * this.get('pagesPerScreen')))
    return Ember.String.htmlSafe(`width:${width}px;`);
  }),

  touchStart(e) {
    let start = e.originalEvent.touches[0].pageX;
    this.set('touchStartX', start);
  },

  touchMove(e) {
    let current = e.originalEvent.touches[0].pageX;
    console.log(current);
    this.set('touchStarted', true);
    this.set('touchCurrentX', current);
  },

  touchEnd() {
    let start = this.get('touchStartX');
    let current = this.get('touchCurrentX');
    let pagesPerScreen = this.get('pagesPerScreen');

    if (this.get('touchStarted') && Math.abs(start - current) > 10) {
      if (start < current) {
        console.log('go back!');
        this.incrementProperty('pageIndex', -pagesPerScreen);
      } else {
        console.log('go forward!');
        this.incrementProperty('pageIndex', pagesPerScreen);
      }
    }

    this.set('touchStarted', false);
  },

  actions: {
    // pageClick(page) {
    //   console.log('page click');
    //   let index = this.get('pages').lastIndexOf(page);
    //   let pagesPerScreen = this.get('pagesPerScreen');

    //   if (pagesPerScreen === 2) {
    //     if (index === 0) {
    //       this.sendAction('prevSection');
    //     } else if (index === this.get('pageCount') - 1) {
    //       this.sendAction('nextSection');
    //     } else if (index % 2 === 0) {
    //       this.incrementProperty('pageIndex', -pagesPerScreen);
    //     } else {
    //       this.incrementProperty('pageIndex', pagesPerScreen);
    //     }
    //   } else {
    //     this.incrementProperty('pageIndex', pagesPerScreen);
    //   }

    // }
    navPrev() {
      let pagesPerScreen = this.get('pagesPerScreen');
      let lastIndex = pagesPerScreen === 1 ? this.get('pageCount') : this.get('pageCount') - 1;

      if (this.get('pageIndex') === lastIndex) {
        this.sendAction('nextSection');
      } else {
        this.incrementProperty('pageIndex', -pagesPerScreen);
      }
    },

    navNext() {
      let pagesPerScreen = this.get('pagesPerScreen');
      let lastIndex = this.get('pageCount') / pagesPerScreen;

      if (this.get('pageIndex') === lastIndex) {
        this.sendAction('nextSection');
      } else {
        this.incrementProperty('pageIndex', pagesPerScreen);
      }
    }
  },

  didInsertElement() {
    this.attrs.fixNavbar();

    Ember.$('.book-container').click((e) => {
      if (e.target.tagname !== 'A' && !Ember.$(e.target).hasClass('book-navigation')) {
        Ember.$('.navbar').toggleClass('show');
      }
    });
  },

  willDestroyElement() {
    this.attrs.unfixNavbar();
  },

  didRender() {
    Ember.run.scheduleOnce('afterRender', this, 'calcContainerWidth');
    Ember.$('.change-section').val(this.get('permalink'));
  },

  // Where is all starts
  onHTML: Ember.observer('html', function() {
    this.get('pages').clear();
    this.set('pageIndex', 0);

    if (this.get('paginated') !== true) {
      Ember.run.schedule('afterRender', this, 'initPagination');
    } else {
      // Skip pagination for sections like the frontmatter
      Ember.$(this.get('html').string).each((i, page) => {
        let pageContent = Ember.$(page).html();
        this.get('pages').addObject(Ember.String.htmlSafe(pageContent));
      });
    }
  }).on('init'),

  initPagination() {
    // All the html is put into the "paginator"
    let paginator = this.$('.paginator .page .page-content');

    Ember.run.schedule('afterRender', () => {
      this.set('paginatorPageHeight', this.$('.paginator .page').height());

      let content = paginator.children();

      // make sure the paginator width and height matches the actual pages
      this.$('.paginator .page').height(this.$('.book-content .page').height());
      this.$('.paginator .page').width(this.$('.book-content .page').width());

      // keep looping and extracting content until there's none left
      while (content.length > 0) {
        this.get('pages').addObject(Ember.String.htmlSafe(this.getNextPageContent(content)));
        content = paginator.children();
      }

      // add an extra page if there's an odd number of pages on the 2 page layout
      if (this.get('pagesPerScreen') === 2 && this.get('pages.length') % 2 !== 0) {
        this.get('pages').addObject('');
      }
    });
  },

  getNextPageContent(content) {
    let toMove = [];

    let maxHeight = this.get('paginatorPageHeight') + 20;

    for (let i = 0; i < content.length; i++) {
      let $p = Ember.$(content[i]);
      let bottomEdge = $p.position().top + $p.height();

      if (bottomEdge > maxHeight) {
        // we can stop looping because this element runs off the page
        break;
      }
      if (bottomEdge < maxHeight) {
        toMove.push($p);
      }
    }

    if (toMove.length < 1) {
      toMove.push(Ember.$(content[0]));
    }

    let newPage = '<div class="page-content">';

    toMove.forEach(el => {
      newPage += el[0].outerHTML;
      el.remove();
    });

    newPage += '</div>';

    return newPage;
  },

  calcContainerWidth() {
    this.set('containerWidth', this.$('.book-container').width());
  },

  // onSubsection: Ember.observer('subsection', function() {
  //   if (this.get('subsection')) {
  //     this.set('pageIndex', this.get('sectionLocations')[this.get('subsection')]);
  //   }
  // })
});
