import Ember from 'ember';

// TODO
// * Subsection links (was done but lost the code)
// * rerender on resize/orientation change
// * nicer section transitions (make seamless)

export default Ember.Component.extend({
  currentUser: Ember.inject.service('currentUser'),
  pages: [''],
  pageIndex: 0,
  pagesPerScreen: 1,

  touchStarted: false,

  // pageRenderChain: Ember.RSVP.resolve(),

  pageCount: Ember.computed.alias('pages.length'),

  bookContentWidth: Ember.computed('pageCount', function() {
    return this.get('pageCount') * 100;
  }),

  carouselOffset: Ember.computed('pageIndex', 'touchMarginModifier', function() {
    return 100 * this.get('pageIndex') / 2;
  }),

  bookContentStyle: Ember.computed('bookContentWidth', 'carouselOffset', function() {
    return Ember.String.htmlSafe(`transform: translateX(-${this.get('carouselOffset')}%)`);
  }),

  // paginatorStyle: Ember.computed('bookContentWidth', function() {
  //   return Ember.String.htmlSafe(`width:${this.get('bookContentWidth')}%;`);
  // }),

  // pageStyle: Ember.computed('containerWidth', 'pageCount', 'pagesPerScreen', function() {
  //   let width = this.get('containerWidth') / this.get('pagesPerScreen'); // - (20 * this.get('pagesPerScreen')))
  //   return Ember.String.htmlSafe(`width:${width}px;`);
  // }),

  touchStart(e) {
    let start = e.originalEvent.touches[0].pageX;
    this.set('touchStartX', start);
  },

  touchMove(e) {
    let current = e.originalEvent.touches[0].pageX;
    this.set('touchStarted', true);
    this.set('touchCurrentX', current);
  },

  touchEnd() {
    let start = this.get('touchStartX');
    let current = this.get('touchCurrentX');

    if (this.get('touchStarted') && Math.abs(start - current) > 10) {
      if (start < current) {
        console.log('go back!');
        this.navPrev();
      } else {
        console.log('go forward!');
        this.navNext();
      }
    }

    this.set('touchStarted', false);
  },
  
  actions: {
    navPrev() {
      this.navPrev();
    },

    navNext() {
      this.navNext();
    }
  },

  navPrev() {
    let pagesPerScreen = this.get('pagesPerScreen');

    if (this.get('pageIndex') === 0) {
      this.$('.book-loading-overlay').show();
      Ember.run.later(() => this.sendAction('prevSection'), 100);
    } else {
      this.incrementProperty('pageIndex', -pagesPerScreen);
    }
    console.log('page %s of %s', this.get('pageIndex'), this.get('pageCount'));
  },

  navNext() {
    let pagesPerScreen = this.get('pagesPerScreen');
    let lastIndex = this.get('pageCount') - pagesPerScreen;

    if (this.get('pageIndex') === lastIndex) {
      this.$('.book-loading-overlay').show();
      Ember.run.later(() => this.sendAction('nextSection'), 100);

    } else {
      this.incrementProperty('pageIndex', pagesPerScreen);
    }
    console.log('page %s of %s', this.get('pageIndex'), this.get('pageCount'));
  },

  didInsertElement() {
    console.log("DBG insert");
    var c = this;
    Ember.$('.book-container').click((e) => {
        console.log("DBG CLICK.container");
      if (!(
        e.target.tagname === 'A' ||
        Ember.$(e.target).hasClass('book-navigation') ||
        Ember.$(e.target).parents().hasClass('book-navigation')
        )) {
        Ember.$('.navbar').toggleClass('show');
      }
    });

    Ember.$('.book-container').on('click', '.internal-link', (e) => {
        console.log("DBG CLICK.internal-link");
      e.preventDefault();
      let permalink = Ember.$(e.target).data('permalink');
      this.sendAction('changeSection', permalink);
    });

    Ember.$(window).on('onorientationchange', () => this.onScreenChange());
    Ember.$(window).on('resize', () => this.onScreenChange());

    Ember.$(".book-content").on('click', 'a', (e) => {
        console.log("DBG CLICK.link");
        var a = Ember.$(e.target);
        if (a.attr("href") === undefined) {
            return;
        }
        if (a.attr("target") === undefined) {
            a.attr("target","_blank");  
        } 
        c.sendAction("onOpenLink",e);
    });
  },

  onScreenChange() {
    // this.rerender();
    // this.$('.paginator').html(this.get('html').string);
    // // this.calcContainerWidth();
    // this.propertyDidChange('html');
  },

  init() {
    console.log("init");
    if (window.innerHeight > window.innerWidth) {
      this.set('pagesPerScreen', 1);
    } else {
      this.set('pagesPerScreen', 2);
    }
    return this._super();
  },

  didRender() {
    Ember.run.schedule('afterRender', this, 'calcContainerWidth');
    Ember.$('.change-section').val(this.get('permalink'));

  },

  didFinishRendering() {
    Ember.$('.book-loading-overlay').hide();
  },

  // Where is all starts
  onHTML: Ember.observer('html', function() {
    // this.get('pages').clear();
    // this.set('pageIndex', 0);

    // if (this.get('paginated') !== true) {
    //   Ember.run.schedule('afterRender', this, 'initPagination');
    // } else {
    //   // Skip pagination for sections like the frontmatter
    //   Ember.$(this.get('html').string).each((i, page) => {
    //     let pageContent = Ember.$(page).html();
    //     if (pageContent) {
    //       this.get('pages').addObject(Ember.String.htmlSafe(pageContent));
    //     }
    //     Ember.run.scheduleOnce('afterRender', this, 'didFinishRendering');
    //   });
    //   if (this.get('pagesPerScreen') === 2 && this.get('pageCount') % 2 !== 0) {
    //     this.get('pages').addObject('');
    //   }
    // }
  }).on('init'),

  initPagination() {
    // All the html is put into the "paginator"
    // let paginator = this.$('.paginator .page .page-content');

    // Ember.run.schedule('afterRender', () => {
    //   this.set('paginatorPageHeight', this.$('.paginator .page').height());

    //   let content = paginator.children();

    //   // make sure the paginator width and height matches the actual pages
    //   this.$('.paginator .page').height(this.$('.book-content .page').height());
    //   this.$('.paginator .page').width(this.$('.book-content .page').width());

    //   // keep looping and extracting content until there's none left
    //   while (content.length > 0) {
    //     this.get('pages').addObject(Ember.String.htmlSafe(this.getNextPageContent(content)));
    //     content = paginator.children();
    //   }

    //   // add an extra page if there's an odd number of pages on the 2 page layout
    //   if (this.get('pagesPerScreen') === 2 && this.get('pageCount') % 2 !== 0) {
    //     this.get('pages').addObject('');
    //   }
    this.set('pageWidth', this.$('.book-content p').width());
    Ember.run.scheduleOnce('afterRender', this, 'didFinishRendering');
    // });
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
  }

  // onSubsection: Ember.observer('subsection', function() {
  //   if (this.get('subsection')) {
  //     this.set('pageIndex', this.get('sectionLocations')[this.get('subsection')]);
  //   }
  // })
});
