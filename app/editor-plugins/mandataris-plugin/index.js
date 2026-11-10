import {
  createEmberNodeSpec,
  createEmberNodeView,
} from '@lblod/ember-rdfa-editor/utils/ember-node';
import { PluginKey, ProsePlugin } from '@lblod/ember-rdfa-editor';
import MandatarisViewComponent from 'frontend-gelinkt-notuleren/components/editor-plugins/mandataris/view';
import { formatMandatarisPeriod } from 'frontend-gelinkt-notuleren/utils/mandataris-date-range';

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
    start: { default: '' },
    end: { default: '' },
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
    const period = formatMandatarisPeriod(node.attrs.start, node.attrs.end);
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
        'data-mv-start': node.attrs.start,
        'data-mv-end': node.attrs.end,
      },
      [displayName, period].filter(Boolean).join(' - '),
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
            start: element.dataset.mvStart,
            end: element.dataset.mvEnd,
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

export const mandatarisModalPluginKey = new PluginKey(
  'MANDATARIS_MODAL_PLUGIN',
);

export function openMandatarisModal(view) {
  const tr = view.state.tr;
  tr.setMeta(mandatarisModalPluginKey, { action: 'open_mandataris_modal' });
  view.dispatch(tr);
}

export function closeMandatarisModal(view) {
  const tr = view.state.tr;
  tr.setMeta(mandatarisModalPluginKey, { action: 'close_mandataris_modal' });
  view.dispatch(tr);
}

export function openMandatarisModalCommand() {
  return function (state, dispatch) {
    if (!dispatch) {
      return false;
    }
    const tr = state.tr;
    tr.setMeta(mandatarisModalPluginKey, { action: 'open_mandataris_modal' });
    dispatch(tr);
    return true;
  };
}

export function mandatarisModalPlugin() {
  return new ProsePlugin({
    key: mandatarisModalPluginKey,
    state: {
      init() {
        return { modalOpen: false };
      },
      apply(tr, pluginState) {
        const meta = tr.getMeta(mandatarisModalPluginKey);
        if (!meta || typeof meta !== 'object' || !('action' in meta)) {
          return pluginState;
        }

        if (meta.action === 'open_mandataris_modal') {
          return { modalOpen: true };
        }
        if (meta.action === 'close_mandataris_modal') {
          return { modalOpen: false };
        }
        return pluginState;
      },
    },
  });
}

export function getMandatarisModalPluginState(state) {
  return mandatarisModalPluginKey.getState(state);
}
