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

  this.transition(
    this.fromRoute('index'),
    this.toRoute('course'),
    this.use('toLeft'),
    this.reverse('toRight')
  );

  this.transition(
    this.fromRoute('*'),
    this.toRoute('*'),
    this.use('toLeft'),
    this.reverse('toRight')
  );

  this.transition(
    this.fromRoute('course.index'),
    this.toRoute('course.module.activity'),
    this.use('toLeft'),
    this.reverse('toRight')
  );
}
