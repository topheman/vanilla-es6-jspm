/**
 * @module src/app
 */
export default class Component {
  /**
   * This class is meant to be extended.
   * It provides the very basic methods to manage WebComponent-like (very simple version) objects.
   *
   * You may override the init method according to your needs
   * @namespace components.Component
   * @class Component
   * @constructor
   * @param {HTMLElement|String} domNode Can be an domNode or a domNode id
   * @param {String} template
   */
  constructor(domNode, template) {
    if (typeof domNode === 'string') {
      let nodeId = domNode;
      domNode = document.getElementById(domNode);
      if (domNode === null) {
        throw new Error(`No element found under #${nodeId}`);
      }
    }
    if (domNode instanceof HTMLElement) {
      this.domNode = domNode;
      this.domNode.innerHTML = template;
    }
    else {
      throw new Error('Invalid param, must be an HTMLElement or a string of the id of one');
    }
  }

  /**
   * Once you instanciated your object, call this method to init it.
   *
   * This method is meant to be overridden.
   * @method init
   * @chainable
   * @return {components.Component.Component}
   */
  init() {
    return this;
  }

  /**
   * Displays block your component.
   * @method show
   * @chainable
   * @return {components.Component.Component}
   */
  show() {
    this.domNode.style.display = "block";
    return this;
  }

  /**
   * Displays none your component.
   * @method hide
   * @chainable
   * @return {components.Component.Component}
   */
  hide() {
    this.domNode.style.display = "none";
    return this;
  }
}
