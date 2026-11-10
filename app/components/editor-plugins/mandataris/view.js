import Component from '@glimmer/component';

export default class MandatarisViewComponent extends Component {
  get node() {
    return this.args.node;
  }

  get name() {
    return [this.node.attrs.firstName, this.node.attrs.lastName]
      .filter(Boolean)
      .join(' ');
  }

  get label() {
    return this.node.attrs.label;
  }

  get displayName() {
    if (this.name && this.label) {
      return `${this.name} (${this.label})`;
    }
    return this.name || this.label;
  }
}
