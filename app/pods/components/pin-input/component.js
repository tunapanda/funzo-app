import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement() {
    this.$('.pin-digit').on('keypress', (e) => Ember.run(() => {
      if (e.target.value.length > 0) {
        e.preventDefault();
      }
      Ember.$(e.target).next().focus();
    })).on('keydown', (e) => Ember.run(() => {
      let key = e.keyCode || e.charCode;
      if ((key === 8 || key === 46) && (e.target.value.length === 0 || Ember.$(e.target).hasClass('last-digit'))) {
        e.target.value = '';
        return Ember.$(e.target).prev().focus();
      }
    }));
  },

  _pin: Ember.observer('digit1', 'digit2', 'digit3', 'digit4', function() {
    let digits = this.getProperties('digit1', 'digit2', 'digit3', 'digit4');
    let value = Object.keys(digits).reduce((prev, val) => prev + (digits[val] || ''), '');
    this.set('pin', value);
  })

  // numbersOnly: Ember.observer('digit1', 'digit2', 'digit3', 'digit4', function () {
  //   if (this.get('digit1') && !this.get('digit1').match(/^[0-9]$/)) {
  //     this.set('digit1', '');
  //   }
  //   if (this.get('digit2') && !this.get('digit2').match(/^[0-9]$/)) {
  //     this.set('digit2', '');
  //   }
  //   if (this.get('digit3') && !this.get('digit3').match(/^[0-9]$/)) {
  //     this.set('digit3', '');
  //   }
  //   if (this.get('digit4') && !this.get('digit4').match(/^[0-9]$/)) {
  //     this.set('digit4', '');
  //   }
  // })
});
