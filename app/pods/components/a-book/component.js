import Ember from 'ember';
import TweenLite from 'tweenlite';

let $ = Ember.$;

export default Ember.Component.extend({
  sectionLocations: {},
  sectionPageCounts: {},
  currentPageNumber: 1,

  elements: {},

  /**
   * current container scroll position
   * @type {Number}
   */
  scrollLeft: 0,

  /**
   * if changing scrollLeft programmatically, whether to animate the change
   * @type {Boolean}
   */
  animateScroll: true,

  /**
   * if scrolling is currently happening
   * @type {Boolean}
   */
  scrolling: false,

  touchStarted: false,

  /**
   * Touch started on component
   *
   * @param  {Object}
   * @return {void}
   */

  touchStart(e) {
    let start = e.originalEvent.touches[0].pageX;
    this.set('touchStartX', start);
    this.set('touchPrevX', start);
    this.set('touchCurrentX', start);
  },

  /**
   * Touch moved on component
   *
   * @param  {Object}
   * @return {void}
   */

  touchMove(e) {
    // e.preventDefault(); // prevent scrolling
    let current = e.originalEvent.touches[0].pageX;
    this.set('touchStarted', true);
    let diff = this.get('touchPrevX') - current;

    this.set('touchPrevX', current);
    this.set('touchCurrentX', current);

    this.set('animateScroll', false);
    this.set('scrolling', true);
    this.set('scrollLeft', this.get('scrollLeft') + diff);

    return false;
  },

  click(e) {
    let $target = $(e.target);

    if ($target.hasClass('internal-link')) {
      e.preventDefault();
      let permalink = $target.data('permalink');
      this.sendAction('changeSection', permalink);
    }

    if (!(
      e.target.tagname === 'A' ||
      $(e.target).hasClass('book-navigation') ||
      $(e.target).parents().hasClass('book-navigation')
      )) {
      this.attrs.toggleNavBar();
    }
  },

  touchEnd() {

    let start = this.get('touchStartX');
    let current = this.get('touchCurrentX');

    let diff = start - current;

    console.log(diff);
    if (this.get('touchStarted') && Math.abs(diff) > 10) {
      this.set('animateScroll', true);
      this.set('scrolling', true);
      this.scrollToNearestPage(start < current ? 'backward' : 'forward');
    }

    this.set('touchStarted', false);
  },

  // scrollStart() {
  //   this.set('touchStarted', true);
  //   this.set('scrolling', true);
  //   this.set('touchStartX', $('.book-content-container').scrollLeft());
  // },

  // scrollMove(e) {
  //   console.log(e);
  //   e.preventDefault();

  //   this.set('scrollLeft', $('.book-content-container').scrollLeft());
  //   this.set('touchCurrentX', $('.book-content-container').scrollLeft());
  // },

  // scrollEnd() {
  //   let start = this.get('touchStartX');
  //   let current = this.get('touchCurrentX');

  //   // if (this.get('touchStarted') && Math.abs(start - current) > 10) {
  //   //   if (start < current) {
  //   //     this.scrollTo(start + this.get('pageWidth'));
  //   //   } else {
  //   //     this.scrollTo(start - this.get('pageWidth'));
  //   //   }
  //   // }
  //   this.set('scrolling', false);
  //   this.set('touchStarted', false);
  // },

  /**
   * Touch ended on component, check what direction the touch was and scroll
   * in that direction
   *
   * @param  {Object}
   * @return {void}
   */



  actions: {
    navPrev() {
      this.navPrev();
    },

    navNext() {
      this.navNext();
    },

    didScroll() {
      if (!this.get('scrolling')) {
        // console.log(e);
        // this.set('scrollLeft', $('.book-content-container').scrollLeft());

        // Ember.run.debounce(this, 'scrollStart', e, 300, true);
        // this.scrollMove(e);
        // Ember.run.debounce(this, 'scrollEnd', e, 300);
      }
      // this.get('elements.page-numbers').css('marginLeft', -this.get('elements.book-content-container').scrollLeft());
    },

    didMouseWheel(e) {
      // e.preventDefault();
    }
  },

  navPrev() {
    if (!this.get('scrolling')) {
      this.set('scrolling', true);
      this.set('animateScroll', true);
      this.set('scrollLeft', this.get('scrollLeft') - this.get('pageWidth'));
    }
  },

  navNext() {
    if (!this.get('scrolling')) {
      this.set('scrolling', true);
      this.set('animateScroll', true);
      this.set('scrollLeft', this.get('scrollLeft') + this.get('pageWidth'));
    }
  },

  /**
   * Scroll container when scrollLeft changes
   *
   * @return {void}
   */

  onScrollLeft: Ember.observer('scrollLeft', function() {
    // if (!this.get('scrolling')) {
    let container = this.$('.book-content-container');
    let current = container.scrollLeft();
    let to = this.get('scrollLeft');
    // console.log(`from ${current} to ${to}`);

    if (this.get('animateScroll')) {
      $('html').velocity('scroll', { axis: 'x', offset: to - current, container: container, mobileHA: false, complete: () => {
        this.didScroll(to > current ? 'forward' : 'backward');
      } });
    } else {
      container.scrollLeft(to);
      this.didScroll(to < current ? 'forward' : 'backward');
    }
    // }
  }),

  /**
   * Called after the container has been scrolled, checks if we have scrolled
   * into another section and changes the route/url accordingly via actions
   *
   * @param  {String}
   * @return {void}
   */

  didScroll(direction) {
    $('.section-anchor').each((i, el) => {
      let $el = $(el);
      if ($el.position().left === 40 && direction === 'forward') {
        // console.log('section ' + $el.data('permalink'));
        this.set('changingSection', true);
        this.sendAction('nextSection');
      }

      if ($el.position().left === this.get('pageWidth') + 40  && direction === 'backward') {
        // console.log('section before ' + $el.data('permalink'));
        this.set('changingSection', true);
        this.sendAction('prevSection');
      }
      this.set('scrolling', false);
    });
  },

  /**
   * Scrolls to a section given its permalink
   *
   * @param  {String}
   * @return {void}
   */

  scrollToSection(permalink) {
    let offset = $('.book-content-container').scrollLeft() + $(`.anchor.section-${permalink}`).position().left - 40;
    this.set('animateScroll', false);
    this.set('scrollLeft', offset);
  },

  didInsertElement() {
    this.set('elements.page-numbers', this.$('.page-numbers'));
    this.set('elements.book-content-container', $('.book-content-container'));
    // $('.book-container').click((e) => {
    //   if (!(
    //     e.target.tagname === 'A' ||
    //     $(e.target).hasClass('book-navigation') ||
    //     $(e.target).parents().hasClass('book-navigation')
    //     )) {
    //     $('.navbar').toggleClass('show');
    //   }
    // });

    // $('.book-container').on('click', '.internal-link', (e) => {
    //   e.preventDefault();
    //   let permalink = $(e.target).data('permalink');
    //   this.sendAction('changeSection', permalink);
    // });

    $(window).on('onorientationchange', this.onScreenChange.bind(this));
    $(window).on('resize', this.onScreenChange.bind(this));

    let _this = this;
    $('.book-content img').click(function() {
      _this.attrs.showImage($(this).attr('src'));
    });

    this.$('h3').each((i, el) => $(el).next().andSelf().wrapAll('<div class="keep-together" />'));

    this.set('pageWidth', $('.book-container').width());
    this.calcPageNumbers();
  },

  willDestroyElement() {
    $(window).off('onorientationchange', this.onScreenChange.bind(this));
    $(window).off('resize', this.onScreenChange.bind(this));
    $('.book-content img').off();
  },

  calcPageNumbers() {
    // console.time('calculate page numbers');
    // let $pageNumbers = $('.page-numbers');
    // // Clear all page numbers
    // $pageNumbers.html('');

    // let lastPosition = 0;
    // let totalPageCount = 0;

    // let pageNumbersHTML = '';

    // this.$('.book-content .section').each((i, section) => {
    //   let sectionPageCount = 0;

    //   // for each child element of a section
    //   $(section).children(':not(a)').each((i, p) => {
    //     let $p = $(p);
    //     let left = $p.position().left;
    //     // Check if the element has a greater x than the last, if it does it
    //     // means were now on the next page so we can increment the page counts
    //     // and add a page number
    //     if (left > lastPosition) {
    //       sectionPageCount++;
    //       totalPageCount++;
    //       pageNumbersHTML += `<div class="page-number" style="left: ${left - 40}px;">Page ${totalPageCount}</div>`;
    //     }
    //     lastPosition = left;
    //   });

    //   console.log($(section).data('section') + ': ' + sectionPageCount);

    //   // Save the section page counts, inside a sync becuase used directly causes
    //   // performamce degredation
    //   console.timeEnd('calculate page numbers');
    //   Ember.run.schedule('sync', () => $(section).data('section') && this.set('sectionPageCounts.' + $(section).data('section'), sectionPageCount));
    // });
    Ember.run.schedule('afterRender', () => {
      // $pageNumbers.append(pageNumbersHTML);

      // TweenLite.fromTo('.cover-img', 0.3, {opacity: 1}, {opacity: 0, lazy: true, delay: 0.3});
    });

  },

  /**
   * If the section has changed externally e.g. via a transition, scroll to the
   * section
   *
   * Also changes the section on first load based on currentSection
   *
   * @param  {Object}
   * @return {void}
   */

  onSection: Ember.observer('currentSection', function() {
    // console.log('SECTION: ' + this.get('currentSection.permalink'));
    Ember.run.schedule('afterRender', () => {

      // changing section is true if we have changed section internally and
      // triggered the trasition, this is to avoid a transition loop where
      // scrolling causes a transition and the transition causes scrolling...
      if (!this.get('changingSection') && this.get('currentSection.permalink')) {
        this.scrollToSection(this.get('currentSection.permalink'));
      }
      this.set('changingSection', false);
    });
  }).on('init'),

  /**
   * If the screen resizes or rotates we may have moved page, and the page
   * numbers will be in the wrong places
   *
   * @return {void}
   */
  onScreenChange() {
    this.scrollToNearestPage();
    this.calcPageNumbers();
    this.set('pageWidth', $('.book-container').width());
  },

  scrollToNearestPage(direction = 'backward') {
    let container = $('.book-content-container');
    if (direction === 'backward') {
      this.set('scrollLeft', container.scrollLeft() - container.scrollLeft() % this.get('pageWidth'));
    } else {
      this.set('scrollLeft', container.scrollLeft() + (this.get('pageWidth') - (container.scrollLeft() % this.get('pageWidth'))));
    }
  }

  // findSections() {
  //   this.$('.book-content .section').each((i, el) => {
  //     if ($(el).data('section')) {
  //       if (i === 0) {
  //         this.set('sectionLocations.0', $(el).data('section'));
  //       } else {
  //         let pageIndex = Math.floor($(el).find('.page-content > *:first-child').position().left / this.get('pageWidth') * 2);
  //         this.set('sectionLocations.' + pageIndex, $(el).data('section'));
  //       }
  //     }
  //   });
  //   this.scrollToSection(this.get('currentSection.permalink'));
  // },

  // onNavigating: Ember.observer('scrolling', function() {
  //   console.log(this.get('scrolling') ? 'started scrolling' : 'stopped scrolling');
  // })

  // onSubsection: Ember.observer('subsection', function() {
  //   if (this.get('subsection')) {
  //     this.set('pageIndex', this.get('sectionLocations')[this.get('subsection')]);
  //   }
  // })
});
