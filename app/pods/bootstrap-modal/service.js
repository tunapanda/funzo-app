import Ember from 'ember';

export default Ember.Service.extend({
  component: null,
  title: '',
  content: '',
  cancel: '',
  ok: '',
  args: {}
});
