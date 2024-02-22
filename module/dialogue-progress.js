import { createShortActionMessage } from "./chat.js";
import {
  FullProgressDialogue
} from "./dialogue-progressFull.js";

export class ProgressDialogue extends Application {
  constructor(actor, ...args) {
    super(...args);
    this._actor = actor;
    this.options.title = "Progress - " + this._actor.name;
    
    Hooks.on("closeFullProgressDialogue", (app,ele) => {
      if(app === this._fullProgressDialogue) this._fullProgressDialogue = null;
    });
    
    Handlebars.registerHelper('isInitial', value => {
      let index = Math.max(0, this._actor.system.progress.length - 4) + value;
      return index === 0;
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
  	  template: "systems/mta/templates/dialogues/dialogue-progress.html"
    });
  }
  
  getData() {
    const data = super.getData();
    data.actorData = this._actor.system;
    data.progress = [{name: "__INITIAL__", beats: data.actorData.beats+5*data.actorData.experience, arcaneBeats: data.actorData.arcaneBeats+5*data.actorData.arcaneExperience}].concat(data.actorData.progress);
    
    data.beats_total = data.progress.reduce((acc, cur) => {
      return +cur.beats > 0 ? acc + +cur.beats : acc;
    }, 0);
    
    data.arcaneBeats_total = data.progress.reduce((acc, cur) => {
      return +cur.arcaneBeats > 0 ? acc + +cur.arcaneBeats : acc;
    }, 0);
    
    data.beats = data.progress.reduce((acc, cur) => {
      return acc + +cur.beats;
    }, 0);
    data.arcaneBeats = data.progress.reduce((acc, cur) => {
      return acc + +cur.arcaneBeats;
    }, 0);
    
    data.isMage = data.actorData.characterType === "Scelesti" || data.actorData.characterType === "Mage";
    data.showExtraBeats = data.actorData.characterType === "Scelesti" || data.actorData.characterType === "Mage" || data.actorData.characterType === "Hunter";
    data.progress = data.progress.slice(-5);
    while(data.progress.length < 5) data.progress.push({name: ""})
    return data;
  }
  
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.addButton').click(ev => this.onAddProgress(ev));
    html.find('.attribute-value').keyup(ev => {
      if(ev.keyCode === 13) this.onAddProgress(ev)
    });
    html.find('.item-delete').click(ev => this.onDeleteProgress(ev));
    html.find('.showAll').click(ev => this.onShowAll(ev));
    html.find(".attribute-value[name='input.name']").focus()
  }
  
  async onDeleteProgress(ev){
    let index = Number(ev.currentTarget.dataset.index);
    index = Math.max(0, this._actor.system.progress.length - 5) + index;
    if(this._actor.system.progress.length < 5) index -= 1;
    await this._actor.removeProgress(index);
    if(this._fullProgressDialogue) this._fullProgressDialogue.render();
    this.render();
  }
  
  async onAddProgress(ev){
    let name = $('input[name ="input.name"]').val() ? $('input[name ="input.name"]').val() : "No Reason";
    let beats = $('input[name ="input.beats"]').val() ? $('input[name ="input.beats"]').val() : 0;
    let arcaneBeats = $('input[name ="input.arcaneBeats"]').val() ? $('input[name ="input.arcaneBeats"]').val() : 0;
    await this._actor.addProgress(name, beats, arcaneBeats);
    if(this._fullProgressDialogue) this._fullProgressDialogue.render();
    this.render();
  }
  
  async onShowAll(ev){
    ev.preventDefault();
    if(this._fullProgressDialogue) this._fullProgressDialogue.bringToTop();
    else this._fullProgressDialogue = await new FullProgressDialogue(this._actor, this).render(true);
  }
  
  /** @override */
  async close(options) {
    if(this._fullProgressDialogue) this._fullProgressDialogue.close();
    await super.close(options);
  }
  
  
}