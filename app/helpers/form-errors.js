import Ember from 'ember';

export function formErrors(params/*, hash*/) {
  let errors = params ? params[0] : [];
  
  // let errorsString = errors.reduce((val, next) => `${val}<p>${next}</p>`, '');
  let errorsString = errors ? errors[0] : [];
  return Ember.String.htmlSafe(`<span class="mdl-textfield__error">${errorsString}</span>`);
}

export default Ember.Helper.helper(formErrors);
