import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { formatMandatarisPeriod } from 'frontend-gelinkt-notuleren/utils/mandataris-date-range';

export default class MandatarisViewComponent extends Component {
  @tracked modalOpen = false;

  get controller() {
    return this.args.controller;
  }

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

  @action
  openModal() {
    this.args.selectNode();
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;
  }

  @action
  replaceMandataris(mandataris) {
    const pos = this.args.getPos();
    if (pos === undefined) return;

    const { schema } = this.controller;
    this.modalOpen = false;
    this.controller.withTransaction(
      (tr) =>
        tr.replaceWith(
          pos,
          pos + this.node.nodeSize,
          schema.node('mandatarisNode', {
            resource: mandataris.uri,
            firstName: mandataris.firstName,
            lastName: mandataris.lastName,
            label: mandataris.label,
            start: mandataris.start,
            end: mandataris.end,
          }),
        ),
      { view: this.controller.mainEditorView },
    );
  }

  @action
  deleteMandataris() {
    const pos = this.args.getPos();
    if (pos === undefined) return;

    this.modalOpen = false;
    this.controller.withTransaction(
      (tr) => tr.delete(pos, pos + this.node.nodeSize),
      { view: this.controller.mainEditorView },
    );
  }
}
