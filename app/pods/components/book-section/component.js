import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement() {
    let container = this.$('.book-content');
    let slick = container.slick({
      dots: false,
      infinite: false,
      speed: 300,
      slidesToShow: 2,
      slidesToScroll: 2,
      adaptiveHeight: false
    });
    window.myslick = slick;
    container.on('click', `.book-content .page:even`, () => slick.slickPrev());
    container.on('click', `.book-content .page:odd`, () => slick.slickNext());
  }
});
