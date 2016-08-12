export default function() {
  this.transition(
    this.fromRoute('login.login-outlet.index'),
    this.toRoute('login.login-outlet.pin'),
    this.use('toLeft'),
    this.reverse('toRight')
  );

  this.transition(
    this.fromRoute('index'),
    this.toRoute('settings'),
    this.use('toLeft'),
    this.reverse('toRight')
  );

  // this.transition(
  //   this.fromRoute('index'),
  //   this.toRoute('book'),
  //   this.use('explode', {
  //     pickOld: '.panel img',
  //     use: ['fly-to', { duration: 300 }],
  //     pickNew: '.cover-img img'
  //   },
  //   {
  //     pick: '.navbar',
  //     use: ['to-up', { duration: 300 }]
  //   },
  //   {
  //     // For everything else that didn't match the above, use a
  //     // fade. I'm giving the fade half as much duration because fade
  //     // includes both fading out and fading in steps, each of which
  //     // spends `duration` milliseconds.
  //     use: ['fade', { duration: 150 }]
  //   })
  // );

  // this.transition(
  //   this.fromRoute('index'),
  //   this.toRoute('book'),
  //   this.use('toLeft'),
  //   this.reverse('toRight')
  // );

  // this.transition(
  //   this.fromRoute('index'),
  //   this.toRoute('course'),
  //   this.use('toLeft'),
  //   this.reverse('toRight')
  // );

  // this.transition(
  //   this.fromRoute('*'),
  //   this.toRoute('*'),
  //   this.use('toLeft'),
  //   this.reverse('toRight')
  // );

  // this.transition(
  //   this.fromRoute('course.index'),
  //   this.toRoute('course.module.activity'),
  //   this.use('toLeft'),
  //   this.reverse('toRight')
  // );

  // this.transition(
  //   this.fromRoute('book.section'),
  //   this.toRoute('book.section'),
  //   this.use('toLeft'),
  //   this.reverse('toRight')
  // );
}
