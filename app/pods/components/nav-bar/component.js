import Ember from "ember";

export default Ember.Component.extend({
  tagName: "nav",
  classNames: ["navbar", "navbar-fixed-top"],

  bookManager: Ember.inject.service("bookManager"),
  session: Ember.inject.service("session"),
  nav: Ember.inject.service("nav"),

  classNameBindings: ["hide"],

  showBackButton: Ember.computed.alias("nav.showBackButton"),
  hide: Ember.computed.alias("nav.hide"),
  showIcons: Ember.computed.alias("nav.showIcons"),

  bookMode: Ember.computed.alias("nav.hide"),

  actions: {
    back() {
      this.sendAction("back");
    },
    logout() {
      this.get("session").invalidate();
    },
    updateIndex() {
      this.get("bookManager").updateIndex();
    },
    deleteAllBooks() {
      this.get("bookManager").deleteAll();
    }
  },

  didInsertElement() {
    this.$(".dropdown-button").dropdown();
    Ember.$.material.ripples();
  }
});
