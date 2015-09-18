/**
 * @module src/app
 */
import Component from '../Component/Component.js';

import template from './Spinner.html!text';

import stylesheet from './Spinner.css!';

export default class Spinner extends Component {
  /**
   * Creates a spinner on any domNode.
   *
   * Since it inherits from {{#crossLink "components.Component.Component"}}Component{{/crossLink}},
   * you have access to {{#crossLink "components.Component.Component/show"}}show{{/crossLink}} and {{#crossLink "components.Component.Component/hide"}}hide{{/crossLink}} methods.
   *
   * Example:
   *
   * ```
   * var mySpinner = (new Spinner(document.getElementById('spinner'))).init().hide();
   * ```
   * @namespace components.Spinner
   * @class Spinner
   * @extends components.Component.Component
   * @constructor
   * @param {HTMLElement|String} domNode Can be an domNode or a domNode id
   */
  constructor(domNode) {
    super(domNode, template);
  }
}
