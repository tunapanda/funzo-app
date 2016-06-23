import Ember from 'ember';

let $ = Ember.$;

export default Ember.Component.extend({
  sectionLocations: {},
  sectionPageCounts: {},
  currentPageNumber: 1,

  touchStarted: false,

  touchStart(e) {
    let start = e.originalEvent.touches[0].pageX;
    this.set('touchStartX', start);
  },

  touchMove(e) {
    e.preventDefault();
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
    },
    didScroll() {
      this.set('scrollLeft', $('.book-content-container').scrollLeft());
      this.$('.page-numbers').css('marginLeft', -$('.book-content-container').scrollLeft());
    },
  },

  navPrev() {
    if (!this.get('navigating')) {
      this.scrollTo($('.book-content-container').scrollLeft() - $('.book-container').width());
    }
  },

  navNext() {
    if (!this.get('navigating')) {
      this.scrollTo($('.book-content-container').scrollLeft() + $('.book-container').width());
    }
  },

  didInsertElement() {
    $('.book-container').click((e) => {
      if (!(
        e.target.tagname === 'A' ||
        $(e.target).hasClass('book-navigation') ||
        $(e.target).parents().hasClass('book-navigation')
        )) {
        $('.navbar').toggleClass('show');
      }
    });

    $('.book-container').on('click', '.internal-link', (e) => {
      e.preventDefault();
      let permalink = $(e.target).data('permalink');
      this.sendAction('changeSection', permalink);
    });

    $(window).on('onorientationchange', () => this.onScreenChange());
    $(window).on('resize', () => this.onScreenChange());

    // $('.book-content-container').on('mousewheel', (e) => e.preventDefault());

    let _this = this;
    $('.book-content img').click(function() {
      _this.attrs.showImage($(this).attr('src'));
    });
    // $('.book-content-container').on('scroll', (e) => {
    //   if (!this.get('navigating')) {
    //     Ember.run.debounce(this, 'scrollStart', e, 300, true);
    //     this.scrollMove(e);
    //     Ember.run.debounce(this, 'scrollEnd', e, 300);
    //   }

    // });

    this.calcPageNumbers();
  },

  calcPageNumbers() {
    this.$('.page-numbers').html();

    let lastPosition = 0;

    let totalPageCount = 0;

    this.$('.book-content .section').each((i, section) => {
      let sectionPageCount = 0;

      $(section).children(':not(a)').each((i, p) => {
        let $p = $(p);

        if ($p.position().left > lastPosition) {
          sectionPageCount++;
          totalPageCount++;
          $('.page-numbers').append(`<div class="page-number" style="left: ${$p.position().left - 40}px;">Page ${totalPageCount}</div>`);
        }
        lastPosition = $p.position().left;
      });

      console.log($(section).data('section') + ': ' + sectionPageCount);
      Ember.run.schedule('sync', () => this.set('sectionPageCounts.' + $(section).data('section'), sectionPageCount));
    });
  },

  // scrollStart() {
  //   this.set('touchStartX', $('.book-content-container').scrollLeft());
  // },

  // scrollMove(e) {
  //   e.preventDefault();
  //   this.set('touchStarted', true);
  //   this.set('touchCurrentX', $('.book-content-container').scrollLeft());
  // },

  // scrollEnd() {
  //   let start = this.get('touchStartX');
  //   let current = this.get('touchCurrentX');

  //   if (this.get('touchStarted') && Math.abs(start - current) > 10) {
  //     if (start < current) {
  //       this.scrollTo(start + $('.book-container').width());
  //     } else {
  //       this.scrollTo(start - $('.book-container').width());
  //     }
  //   }

  //   this.set('touchStarted', false);
  // },


  scrollTo(to, animate = true) {
    this.set('navigating', true);
    let current = $('.book-content-container').scrollLeft();
    // console.log(`from ${current} to ${to}`);
    if (animate) {
      $('.book-content-container').animate({ scrollLeft: to }, () => {
        // this.set('navigating', false);
        this.didNavigate(to > current ? 'forward' : 'backward');
      });
    } else {
      $('.book-content-container').scrollLeft(to);
      // this.set('navigating', false);
      this.didNavigate(to < current ? 'forward' : 'backward');
    }
  },

  didNavigate(direction) {
    $('.section-anchor').toArray().forEach((el) => {
      if ($(el).position().left === 40 && direction === 'forward') {
        // console.log('section ' + $(el).data('permalink'));
        this.willChangeSection();
        this.sendAction('nextSection');
      }

      if ($(el).position().left === $('.book-container').width() + 40  && direction === 'backward') {
        // console.log('section before ' + $(el).data('permalink'));
        this.willChangeSection();
        this.sendAction('prevSection');
      }
      this.set('navigating', false);
    });
  },

  willChangeSection() {
    this.set('changingSection', true);
  },

  scrollToSection(permalink) {
    let offset = $('.book-content-container').scrollLeft() + $(`.anchor.section-${permalink}`).position().left - 40;
    this.scrollTo(offset, false);
  },

  onSection: Ember.observer('currentSection', function() {
    // console.log('SECTION: ' + this.get('currentSection.permalink'));
    Ember.run.schedule('afterRender', () => {
      if (!this.get('changingSection')) {
        this.scrollToSection(this.get('currentSection.permalink'));
      }
      this.set('changingSection', false);
    });
  }).on('init'),

  onScreenChange() {
    this.scrollToNearestPage();
    this.calcPageNumbers();
  },

  scrollToNearestPage() {
    this.scrollTo($('.book-content-container').scrollLeft() - $('.book-content-container').scrollLeft() % $('.book-container').width());
  },

  didRender() {
    this._super(...arguments);
  }

  // findSections() {
  //   this.$('.book-content .section').each((i, el) => {
  //     if ($(el).data('section')) {
  //       if (i === 0) {
  //         this.set('sectionLocations.0', $(el).data('section'));
  //       } else {
  //         let pageIndex = Math.floor($(el).find('.page-content > *:first-child').position().left / $('.book-container').width() * 2);
  //         this.set('sectionLocations.' + pageIndex, $(el).data('section'));
  //       }
  //     }
  //   });
  //   this.scrollToSection(this.get('currentSection.permalink'));
  // },

  // onNavigating: Ember.observer('navigating', function() {
  //   console.log(this.get('navigating') ? 'started navigating' : 'stopped navigating');
  // })

  // onSubsection: Ember.observer('subsection', function() {
  //   if (this.get('subsection')) {
  //     this.set('pageIndex', this.get('sectionLocations')[this.get('subsection')]);
  //   }
  // })
});
