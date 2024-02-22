import { createShortActionMessage } from "./chat.js";

export class FullProgressDialogue extends Application {
  constructor(actor, progressDialogue, ...args) {
    super(...args);
    this._actor = actor;
    this._progressDialogue = progressDialogue;
    this.options.title = "Full Progress - " + this._actor.name;
    
    Handlebars.registerHelper('isInitial', value => {
      return value === 0;
    });
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["worldbuilding", "dialogue", "mta-sheet"],
  	  template: "systems/mta/templates/dialogues/dialogue-progressFull.html"
    });
  }
  
  getData() {
    const data = super.getData();
    data.actorData = this._actor.system;
    data.progress = [{name: "__INITIAL__", beats: data.actorData.beats+5*data.actorData.experience, arcaneBeats: data.actorData.arcaneBeats+5*data.actorData.arcaneExperience}].concat(data.actorData.progress);
    data.isMage = data.actorData.characterType === "Scelesti" || data.actorData.characterType === "Mage";
    data.showExtraBeats = data.actorData.characterType === "Scelesti" || data.actorData.characterType === "Mage" || data.actorData.characterType === "Hunter";
    //data.progress = data.actorData.progress;
    return data;
  }
  
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.item-delete').click(ev => this.onDeleteProgress(ev));
  }
  
  async onDeleteProgress(ev){
    let index = Number(ev.currentTarget.dataset.index) - 1;
    await this._actor.removeProgress(index);
    this._progressDialogue.render();
    this.render();
  }
}