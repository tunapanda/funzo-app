import Ember from 'ember';

/* global videojs */

export default Ember.Component.extend({
  video: true,

  actions: {
    close() {
      let video = this.get('video');
      this.set('video', null);
      video.dispose();
      Ember.$('.modal').modal('hide');
    }
  },

  didRender() {
    const video = videojs(this.$('video')[0], {
      controls: true,
      autoplay: true,
      preload: 'auto',
      fluid: true
    });
    this.set('video', video);
  },

  videoLocation: Ember.computed('args.video.url', 'args.video.bookLocation', function() {
    return this.get('args.video.bookLocation') + 'OEBPS/' + this.get('args.video.url')
  }),
  thumbnailLocation: Ember.computed('args.video.thumbnail', 'args.video.bookLocation', function () {
    return this.get('args.video.bookLocation') + 'OEBPS/' + this.get('args.video.thumbnail')
  })
});
