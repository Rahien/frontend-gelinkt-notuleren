import {
  createEmberNodeSpec,
  createEmberNodeView,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import MandatarisViewComponent from 'frontend-gelinkt-notuleren/components/editor-plugins/mandataris/view';

/**
 * @typedef {import('@lblod/ember-rdfa-editor/utils/ember-node').EmberNodeConfig} EmberNodeConfig
 */

/**
 * @type {EmberNodeConfig}
 */
const emberNodeConfig = {
  name: 'mandataris-view',
  component: MandatarisViewComponent,
  inline: true,
  group: 'inline variable',
  atom: true,
  draggable: false,
  attrs: {
    resource: {},
    firstName: { default: '' },
    lastName: { default: '' },
    label: { default: '' },
    publicReference: { default: true },
  },
  toDOM: (node) => {
    const name = [node.attrs.firstName, node.attrs.lastName]
      .filter(Boolean)
      .join(' ');
    const displayName =
      name && node.attrs.label
        ? `${name} (${node.attrs.label})`
        : name || node.attrs.label;
    return [
      'span',
      {
        'data-ember-node': 'mandataris-view',
        resource: node.attrs['resource'],
        property: 'ext:mention',
        rev: 'ext:isMentionedBy',
        typeof: 'mandaat:Mandataris',
        'data-mv-public-reference': node.attrs.publicReference,
        'data-mv-first-name': node.attrs.firstName,
        'data-mv-last-name': node.attrs.lastName,
        'data-mv-label': node.attrs.label,
      },
      displayName,
    ];
  },
  parseDOM: [
    {
      tag: 'span',
      getAttrs(element) {
        if (element.dataset['emberNode'] === 'mandataris-view') {
          return {
            resource: element.getAttribute('resource'),
            firstName: element.dataset.mvFirstName,
            lastName: element.dataset.mvLastName,
            label: element.dataset.mvLabel,
            publicReference: element.dataset.mvPublicReference !== 'false',
          };
        }
        return false;
      },
    },
  ],
};

export const mandatarisNode = createEmberNodeSpec(emberNodeConfig);
export const mandatarisNodeView = createEmberNodeView(emberNodeConfig);

// unused
export const mandatarisWidget = {
  desiredLocation: 'insertSidebar',
  componentName: 'editor-plugins/mandataris/sidebar-insert',
};
