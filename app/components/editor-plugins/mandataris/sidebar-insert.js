import Component from '@glimmer/component';
import { action } from '@ember/object';

import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  BESLUIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import {
  closeMandatarisModal,
  getMandatarisModalPluginState,
  openMandatarisModal,
} from '../../../editor-plugins/mandataris-plugin';

export default class MandatarisSidebarInsertComponent extends Component {
  get controller() {
    return this.args.controller;
  }

  get modalEnabled() {
    return (
      getMandatarisModalPluginState(this.controller.mainEditorState)
        ?.modalOpen ?? false
    );
  }

  get decisionNodeLocation() {
    return (
      findAncestors(this.controller.mainEditorState.selection.$from, (node) => {
        return hasOutgoingNamedNodeTriple(
          node.attrs,
          RDF('type'),
          BESLUIT('Besluit'),
        );
      })[0] ?? null
    );
  }
  get isDisabled() {
    return !this.decisionNodeLocation;
  }

  @action
  toggleModal() {
    if (this.modalEnabled) {
      closeMandatarisModal(this.controller.mainEditorView);
    } else {
      openMandatarisModal(this.controller.mainEditorView);
    }
  }

  @action
  insertMandataris(mandataris) {
    closeMandatarisModal(this.controller.mainEditorView);
    if (!this.isDisabled) {
      const { schema } = this.controller;
      this.controller.withTransaction(
        (tr) => {
          return tr.replaceSelectionWith(
            schema.node('mandatarisNode', {
              resource: mandataris.uri,
              firstName: mandataris.firstName,
              lastName: mandataris.lastName,
              label: mandataris.label,
              start: mandataris.start,
              end: mandataris.end,
            }),
          );
        },
        { view: this.controller.mainEditorView },
      );
    }
  }
}
