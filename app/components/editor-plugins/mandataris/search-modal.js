import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import {
  executeQuery,
  sparqlEscapeString,
  sparqlEscapeUri,
} from '@lblod/ember-rdfa-editor-lblod-plugins/utils/sparql-helpers';

const ENDPOINT = '/sparql';
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_LIMIT = 10;

export default class MandatarisSearchModalComponent extends Component {
  @service currentSession;

  @tracked searchValue = '';
  @tracked _selectedMandataris;
  @tracked mandatarissen = tracked([]);
  @tracked includedMandatarissen = [];

  @action
  didInsert() {
    const parser = new DOMParser();
    const document = parser.parseFromString(
      this.args.controller.htmlContent ?? '',
      'text/html',
    );
    this.includedMandatarissen = Array.from(
      document.querySelectorAll('[data-ember-node="mandataris-view"]'),
    )
      .map((element) => element.getAttribute('resource'))
      .filter(Boolean);
  }

  fetchMandatarissen = restartableTask(async (searchString) => {
    const value = searchString.trim();
    const eenheidUri = this.currentSession.group?.uri;
    if (!value || !eenheidUri) {
      this.mandatarissen = tracked([]);
      return;
    }

    await timeout(SEARCH_DEBOUNCE_MS);

    const query = /* sparql */ `
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX generiek: <https://data.vlaanderen.be/ns/generiek#>
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX persoon: <https://data.vlaanderen.be/ns/persoon#>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

      SELECT DISTINCT ?s ?fname ?lname ?label ?start ?end WHERE {
        ?s a mandaat:Mandataris.
        ?s mandaat:isBestuurlijkeAliasVan ?persoon.
        ?persoon foaf:familyName ?lname.
        ?persoon persoon:gebruikteVoornaam ?fname.
        ?lname bif:contains ${sparqlEscapeString(`'${value}'`)} .
        ?s org:holds ?mandaat.
        ?mandaat org:role / skos:prefLabel ?label.
        ?s mandaat:start ?start .
        OPTIONAL {
          ?s mandaat:einde ?end .
        }
        ?mandaat ^org:hasPost / mandaat:isTijdspecialisatieVan / besluit:bestuurt ${sparqlEscapeUri(
          eenheidUri,
        )}.
      } limit ${SEARCH_LIMIT}
    `;

    const response = await executeQuery({ query, endpoint: ENDPOINT });

    this.mandatarissen = tracked(
      response.results.bindings.map((binding) => {
        const firstName = binding.fname.value;
        const lastName = binding.lname.value;
        return {
          uri: binding.s.value,
          firstName,
          lastName,
          label: binding.label.value,
          fullName: [firstName, lastName].filter(Boolean).join(' '),
        };
      }),
    );
  });

  @action
  updateFilter(event) {
    this.searchValue = event.target.value;
    this._selectedMandataris = null;
    this.fetchMandatarissen.perform(this.searchValue);
  }

  @action
  selectMandataris(mandataris) {
    this._selectedMandataris = mandataris;
  }

  get selectedMandataris() {
    return this._selectedMandataris ?? this.mandatarissen?.[0];
  }

  isInserted = (mandataris) =>
    this.includedMandatarissen.includes(mandataris.uri);
}
