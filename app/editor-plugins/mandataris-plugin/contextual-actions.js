import { v4 as uuidv4 } from 'uuid';
import { findAncestors } from '@lblod/ember-rdfa-editor/utils/position-utils';
import { hasOutgoingNamedNodeTriple } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/namespace';
import {
  BESLUIT,
  RDF,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { openMandatarisModalCommand } from './index';

const MANDATARIS_ACTION_GROUP_ID =
  'mandataris-action-group-4f8e8fc4-6c9c-4f9d-bb6e-4c1a1e2a8e4c';

function isInDecision(state) {
  return Boolean(
    findAncestors(state.selection.$from, (node) =>
      hasOutgoingNamedNodeTriple(node.attrs, RDF('type'), BESLUIT('Besluit')),
    )[0],
  );
}

export function getMandatarisActionGroups() {
  return function (state, searchQuery) {
    if (!isInDecision(state)) return [];

    const label = getTranslationFunction(state)(
      'mandataris-plugin.type',
      'Mandataris',
    );
    const matchesSearch =
      !searchQuery ||
      label.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase());

    return [
      {
        id: MANDATARIS_ACTION_GROUP_ID,
        getActions() {
          if (!matchesSearch) return [];
          return [
            {
              id: uuidv4(),
              label,
              group: MANDATARIS_ACTION_GROUP_ID,
              command: openMandatarisModalCommand(),
            },
          ];
        },
      },
    ];
  };
}
