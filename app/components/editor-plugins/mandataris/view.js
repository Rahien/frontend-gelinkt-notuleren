import Component from '@glimmer/component';
import { formatMandatarisPeriod } from 'frontend-gelinkt-notuleren/utils/mandataris-date-range';

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

  get period() {
    return formatMandatarisPeriod(this.node.attrs.start, this.node.attrs.end);
  }

  get displayName() {
    const name =
      this.name && this.label
        ? `${this.name} (${this.label})`
        : this.name || this.label;
    return [name, this.period].filter(Boolean).join(' - ');
  }
}
