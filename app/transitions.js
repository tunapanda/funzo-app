export default function() {
  this.transition(
    this.fromRoute('login.login-outlet.index'),
    this.toRoute('login.login-outlet.pin'),
    this.use('toLeft'),
    this.reverse('toRight')
  );
}
