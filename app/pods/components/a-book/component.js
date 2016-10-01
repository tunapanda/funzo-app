import Ember from 'ember';

const { $, computed, RSVP } = Ember;

export default Ember.Component.extend({
  sectionLocations: [],

  _currentSections: computed.filterBy('sections', 'isCurrentSection', true),
  currentSection: computed.alias('_currentSections.firstObject'),

  elements: {},

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

  /**
   * Touch ended on component, check what direction the touch was and scroll
   * in that direction
   *
   * @param  {Object}
   * @return {void}
   */
  touchEnd() {
    let start = this.get('touchStartX');
    let current = this.get('touchCurrentX');

    let diff = start - current;

    if (this.get('touchStarted') && Math.abs(diff) > 10) {
      this.set('animateScroll', true);
      this.set('scrolling', true);
      this.scrollToNearestPage(start < current ? 'backward' : 'forward');
    }

    this.set('touchStarted', false);
  },

  actions: {
    clickBook(e) {
      let $target = $(e.target);

      // internal section links
      if ($target.hasClass('internal-link')) {
        e.preventDefault();
        let permalink = $target.data('permalink');
        return this.attrs.changeSection(permalink);
      }

      // Image popups
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return this.attrs.showImage($target.attr('src'));
      }

      // footnote links
      if ($target.hasClass('ftnt')) {
        e.preventDefault();
        return this.scrollToFootnote($target.data('ref'));
      }

      // External links
      if (e.target.tagName === 'A') {
        console.log('DBG CLICK.link');
        if ($target.attr('href') === undefined) {
          return;
        }
        if ($target.attr('target') === undefined) {
          $target.attr('target', '_blank');
        }
        this.sendAction('onOpenLink', e);
      }

      // otherwise toggle the navbars
      if (e.target.tagName !== 'A') {
        $('.navbar').toggleClass('show');
      }
    },

    navPrev() {
      this.navPrev();
    },

    navNext() {
      this.navNext();
    },

    didScroll(){}
  },

  animateScrollLeft(position) {
    if (!this.get('scrolling')) {
      this.set('scrolling', true);
      this.set('animateScroll', true);
      this.set('scrollLeft', position);
    }
  },

  updateScrollPosition() {
    var scrollLeft = this.get('scrollLeft');
    console.log('about to send page change with position', scrollLeft);
    this.sendAction('onPageChange', scrollLeft);
  },

  navPrev() {
    this.animateScrollLeft(this.get('scrollLeft') - this.get('pageWidth'));
    this.updateScrollPosition();
  },

  navNext() {
    this.animateScrollLeft(this.get('scrollLeft') + this.get('pageWidth'));
    this.updateScrollPosition();
  },

  /**
   * Scroll container when scrollLeft changes, triggers didScroll
   *
   * @return {void}
   */

  onScrollLeft: Ember.observer('scrollLeft', function() {
    let container = this.$('.book-content-container');
    let current = container.scrollLeft();
    let to = this.get('scrollLeft');
    let didScroll = () => this.didScroll(to > current ? 'forward' : 'backward');

    if (this.get('animateScroll')) {
      $('html').velocity('scroll', {
        axis: 'x',
        offset: to - current,
        container: container,
        mobileHA: false,
        complete: didScroll,
      });
    } else {
      container.scrollLeft(to);
      didScroll();
    }
  }),

  /**
   * Called after the container has been scrolled, checks if we have scrolled
   * into another section and changes the route/url accordingly via actions
   *
   * @param  {String}
   * @return {void}
   */

  didScroll(direction) {
    let scrollLeft   = this.get('scrollLeft'),
        newSection   = this.get('sections').find(sec => sec.get('endPosition') > scrollLeft),
        newPermalink = newSection.get('permalink'),
        oldPermalink = this.get('currentRouteModel.permalink'),
        oldSection   = this.get('sections').findBy('permalink', oldPermalink);

    console.log('checking if we have changed section after scrolling ' + direction);
    console.log('from ' + oldPermalink + ' to ' + newPermalink);

    if (newPermalink !== oldPermalink) {
      console.log('section changed. updating permalink');
      oldSection.set('isCurrentSection', false);
      newSection.set('isCurrentSection', true);
      // FIXME when paging back from the start of a section, this will force a skip
      // all the way to the begninning of the section you just entered
      this.attrs.changePermalink(newPermalink);
    }

    this.set('scrolling', false);
  },

  showSection(permalink) {
    let newSection = this.get('sections').findBy('permalink', permalink);

    this.get('sections').setEach('isHidden', true);

    let index = this.get('sections').indexOf(newSection);
    if (this.get('sections').objectAt(index - 1)) {
      this.get('sections').objectAt(index - 1).set('isHidden', false);
    }
    newSection.set('isHidden', false);
    if (this.get('sections').objectAt(index + 1)) {
      this.get('sections').objectAt(index + 1).set('isHidden', false);
    }
  },

  /**
   * Scrolls to a section given its permalink
   *
   * @param  {String}
   * @return {void}
   */
  scrollToSection(permalink) {
    let section = this.get('sections').findBy('permalink', permalink);
    let offset = section ? section.get('startPosition') : 0;
    console.log(`scrolling to ${permalink} at ${offset}`);
    this.set('animateScroll', false);
    this.set('scrollLeft', offset);
  },

  scrollToFootnote(footnote) {
    // references can be anywhere on the page, so use parent paragraph to get offset to scroll to
    let $el = this.$('#' + footnote);
    if ($el.parent()[0].tagName === 'SUP') {
      $el = $el.parent().parent();
    }

    let offset = $el.offset().left - this.get('elements.book-content-container').offset().left + this.get('elements.book-content-container').scrollLeft() - 40;
    this.set('animateScroll', false);
    this.set('scrollLeft', offset);
  },

  didInsertElement() {
    this.set('pageWidth', $('.book-container')[0].clientWidth);

    this.waitForImages().then(() => {
      this.findSections();
      Ember.run.scheduleOnce('afterRender', () => {
        console.log("starting scroll left:", this.get('startingScrollLeft'));
        if(this.get('startingScrollLeft')) {
          console.warn("SCROLLING!");
          this.set('animateScroll', false);
          this.set('scrollLeft', this.get('startingScrollLeft'));
        } else if(this.get('currentSection.permalink') !== this.get('currentRouteModel.permalink')) {
          this.scrollToSection(this.get('currentRouteModel.permalink'));
        }

        this.set('hideLoading', true);
      });
    });

    this.set('elements.page-numbers', this.$('.page-numbers'));
    this.set('elements.book-content-container', $('.book-content-container'));

    $(window).on('onorientationchange', this.onScreenChange.bind(this));
    $(window).on('resize', this.onScreenChange.bind(this));

    this.$('h3').each((i, el) => $(el).next().andSelf().wrapAll('<div class="keep-together" />'));
  },

  willDestroyElement() {
    $(window).off('onorientationchange', this.onScreenChange.bind(this));
    $(window).off('resize', this.onScreenChange.bind(this));
  },

  /**
   * We have to wait for images to load, because they cause text reflowing and move the sections around.
   */
  waitForImages() {
    return new RSVP.Promise((resolve) => {
      let imagesLoaded = 0;
      let images = this.$('p img');
      images.load(() => {
        imagesLoaded++;
        if (images.length === imagesLoaded) {
          resolve();
        }
      });
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

  onSection: Ember.observer('currentRouteModel', function() {
    console.log('SECTION: ' + this.get('currentRouteModel.permalink'));
    Ember.run.schedule('afterRender', () => {
      // changing section is true if we have changed section internally and
      // triggered the trasition, this is to avoid a transition loop where
      // scrolling causes a transition and the transition causes scrolling...
      if (this.get('currentRouteModel.permalink') !== this.get('currentSection.permalink')) {
        this.scrollToSection(this.get('currentRouteModel.permalink'));
      }
    });
  }),

  /**
   * If the screen resizes or rotates we may have moved page, and the page
   * numbers will be in the wrong places
   *
   * @return {void}
   */
  onScreenChange() {
    this.scrollToNearestPage();
    this.set('pageWidth', $('.book-container').width());
  },

  scrollToNearestPage(direction = 'backward') {
    let container = this.get('elements.book-content-container');
    if (direction === 'backward') {
      this.set('scrollLeft', container.scrollLeft() - container.scrollLeft() % this.get('pageWidth'));
    } else {
      this.set('scrollLeft', container.scrollLeft() + (this.get('pageWidth') - (container.scrollLeft() % this.get('pageWidth'))));
    }
  },

  findSections() {
    let scrollLeft = this.get('scrollLeft'),
        pageWidth  = this.get('pageWidth');

    console.groupCollapsed("finding sections");
    console.log('scrollLeft:', scrollLeft, 'pageWidth:', pageWidth);

    this.$('.section-anchor').each((i, el) => {
      let section       = this.get('sections').objectAt(i),
          prev          = this.get('sections').objectAt(i - 1),
          left          = el.offsetLeft - 40,
          startPosition = left + scrollLeft,
          endPosition   = startPosition - pageWidth;

      console.group("found section #" + i + ": ", el.getAttribute("data-permalink"));
      console.log("prev:", prev);
      console.log("left:", left, "start:", startPosition, "end:", endPosition);
      console.groupEnd();

      if (i !== 0) { prev.set('endPosition', endPosition); }
      section.set('startPosition', startPosition);
    });
    console.groupEnd();

    console.table(this.get('sections').toArray());
  }
});
