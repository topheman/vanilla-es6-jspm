import Component from '../Component/Component';

import template from './Spinner.html!text';

import stylesheet from './Spinner.css!';

export default class Spinner extends Component {
  constructor(domNode){
    super(domNode, template);
  }
}