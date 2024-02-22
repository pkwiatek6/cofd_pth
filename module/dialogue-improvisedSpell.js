import {
  DiceRollerDialogue
} from "./dialogue-diceRoller.js";
import { MTA } from "./config.js";

export class ImprovisedSpellDialogue extends FormApplication  {
  constructor(spell, actor) {
    super(spell, {submitOnChange: true, closeOnSubmit: false});
    console.log("OBJECT", this.object)
    this.actor = actor;
    this.valueChange = {
      dicePool : false
    };
    
    this.options.title = this.actor.name + (this.object.name === "New Active Spell" ? " - Improvised Spellcasting" : " - " + this.object.name);
    this.paradoxRolled = false;
    
    Handlebars.registerHelper('getParadoxSleeperDiceQuality', function (value) {
      if(value === "A few") return "9-again";
      else if(value === "Large group") return "8-again";
      else if(value === "Full crowd") return "Rote quality";
      else return ""
    });
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["mta-sheet", "dialogue"],
  	  template: "systems/mta/templates/dialogues/dialogue-improvisedSpell.html",
      resizable: true
    });
  }
  
  getData() {
    const data = super.getData();
    //Object.assign(data.object, data.object.system)
    data.object = this.object.system;
    
    // Define basic values
    data.config = CONFIG.MTA;
    const actorData = this.actor.system;
    const objectData = data.object;
    const conf = CONFIG.MTA.spell_casting;
    data.valueChange = this.valueChange;

    const isAnyMage = actorData.characterType === "Mage" || actorData.characterType === "Scelesti";
    if(actorData.characterType === "Scelesti") data.scelestiRank = actorData.scelestiRank;
    
    const arcanumName = objectData.arcanum;
    let arcanum = actorData.arcana_gross.hasOwnProperty(arcanumName) ? actorData.arcana_gross[arcanumName] : actorData.arcana_subtle[arcanumName];  
    
    // Initialise values
    ["bonusDice", "withstandRating", "additionalReach", "yantraBonus", "manaMod"].forEach(val => objectData[val] = objectData[val] ? objectData[val] : 0);
    objectData.paradox.previous_rolls ||= 0;
    objectData.paradox.bonus ||= 0;
    if(objectData.paradox_tenAgain === undefined) objectData.paradox_tenAgain = true;
    if(objectData.spell_tenAgain === undefined) objectData.spell_tenAgain = true;
    if(!objectData.condition) objectData.condition = "No condition";
    //if(objectData.paradox_tenAgain === undefined) objectData.paradox_tenAgain = true;
    
    // Calculate base reach & mana cost
    const activeSpells = this.actor.items.filter(item => item.type === "activeSpell" && !item.system.isRelinquishedSafely && !item.system.isRelinquished);
    let activeSpellLimit = isAnyMage ? actorData.mage_traits.gnosis.final : 1;
    if(activeSpells?.length >= activeSpellLimit) data.activeSpellReach = activeSpells.length - activeSpellLimit + 1;

    objectData.reachFree = (isAnyMage ? (objectData.castRote || objectData.castGrimoire || objectData.castRoteOwn) ? 5 - objectData.level + 1 : arcanum.final - objectData.level + 1 : 1);
    objectData.reach = objectData.additionalReach + (data.activeSpellReach ? data.activeSpellReach : 0);

    objectData.manaCost = objectData.paradox.mana_spent + objectData.manaMod;
    
    // Spell factor and attainment increases to Reach & Mana
    if(objectData.potency.isAdvanced) objectData.reach++;
    if(objectData.attainment_permanence) objectData.manaCost++;
    else if(objectData.duration.isAdvanced) objectData.reach++;
    if(objectData.attainment_everywhere) objectData.manaCost++;
    else if(objectData.scale.isAdvanced) objectData.reach++;
    if(objectData.attainment_timeInABottle) objectData.manaCost++;
    else if(objectData.casting_time.isAdvanced) objectData.reach++;
    if(objectData.range.isAdvanced) objectData.reach++;
    if(objectData.range.value === "Remote View") objectData.reach++;
    if(objectData.duration.value === "Indefinite"){
      objectData.reach++;
      objectData.manaCost++;
    } 
    if(!arcanum.isRuling && !objectData.castPraxis && !objectData.castRote && !objectData.castRoteOwn && !objectData.castGrimoire && isAnyMage ) objectData.manaCost++;
    if(objectData.attainment_sympatheticRange) objectData.manaCost++;
    if(objectData.attainment_temporalSympathy) objectData.manaCost++;
    if(objectData.condition !== "No condition") objectData.manaCost++;

    if(objectData.isBefouled && !objectData.castRote) {
      if(MTA.scelestiRanks.indexOf(actorData.scelestiRank) >= MTA.scelestiRanks.indexOf("Nasnas")) {
        if(!objectData.castPraxis) objectData.manaCost++;
      }
      else {
        if(objectData.castPraxis) objectData.manaCost++;
        else objectData.manaCost += objectData.level;
      }
    }
    
    // Calculate casting time
    data.ritualCastingTime = isAnyMage ? conf.casting_time.standard[Math.max(0,Math.floor((actorData.mage_traits.gnosis.final-1) / 2))] : "5 hours";

    data.casting_time = [];
    let baseCastingTime = data.ritualCastingTime.split(" ");
    if(objectData.castGrimoire) baseCastingTime[0] *= 2;
    for(let i = 0; i < 6; i++){
      data.casting_time[i] = baseCastingTime[0]*(i+1) + " " + (i > 0 ? (baseCastingTime[1].charAt(baseCastingTime[1].length-1) != "s"  ? baseCastingTime[1] + 's' : baseCastingTime[1]) : baseCastingTime[1]);
    }
    if(!objectData.casting_time.value) objectData.casting_time.value = data.casting_time[0]; 
    

    // Calculate free spell factors
    let durBonus = 0;
    if(objectData.condition === "Improbable condition") durBonus += 1;
    else if(objectData.condition === "Infrequent condition") durBonus += 2;
    else if(objectData.condition === "Common condition") durBonus += 3;
    
    let primaryFactor = objectData.primaryFactor.toLowerCase();
    
    objectData.potency.primaryFactor = primaryFactor === "potency" ? true : false;
    if(isAnyMage) objectData.potency.freeFactor = objectData.potency.primaryFactor ? (objectData.potency.isAdvanced ? conf.potency.advanced[Math.min(arcanum.final-1, conf.potency.advanced.length-1)] : conf.potency.standard[Math.min(arcanum.final-1, conf.potency.standard.length-1)]) : 0;
    objectData.duration.primaryFactor = primaryFactor === "duration" ? true : false;
    if(isAnyMage)  objectData.duration.freeFactor = objectData.duration.primaryFactor ? (objectData.duration.isAdvanced ? conf.duration.advanced[Math.min(arcanum.final-1+durBonus, conf.duration.advanced.length-1)] : conf.duration.standard[Math.min(arcanum.final-1+durBonus, conf.duration.standard.length-1)]) : durBonus ? (objectData.duration.isAdvanced ? conf.duration.advanced[Math.min(durBonus, conf.duration.advanced.length-1)] : conf.duration.standard[Math.min(durBonus,conf.duration.standard.length-1)]) : 0;

    // Calculate dice penalties from spell factors
    data.potencyPenalty = this._calculateFactorPenalty("potency", primaryFactor === "potency",arcanum.final,objectData);
    data.durationPenalty = this._calculateFactorPenalty("duration", primaryFactor === "duration",arcanum.final,objectData, durBonus);
    data.scalePenalty = this._calculateFactorPenalty("scale", false,arcanum.final,objectData);
    data.castingTimePenalty = this._calculateCastingTimePenalty(arcanum.final,objectData,data);

    // Calculate spellcasting dice pool
    data.yantraBonusFinal = Math.min(5, objectData.yantraBonus - data.potencyPenalty - data.durationPenalty - data.scalePenalty);

    objectData.woundPenalty = this.actor.getWoundPenalties();

    objectData.diceBase = isAnyMage ? actorData.mage_traits.gnosis.final + arcanum.final : actorData.willpower.max;
    objectData.spellcastingDice =  objectData.diceBase + objectData.bonusDice + data.castingTimePenalty + data.yantraBonusFinal - objectData.woundPenalty;

    if(objectData.spellcastingDice < 1) objectData.chance_die = true;
    else objectData.chance_die = false;

    data.spellImpossible = objectData.spellcastingDice < -5 ? true : false;
    
    // Calculate paradox dice
    const rF = isAnyMage ? Math.floor((actorData.mage_traits.gnosis.final+1) / 2)*(objectData.reach-objectData.reachFree) : objectData.reach-objectData.reachFree;
    let paradoxReachBonus = objectData.reach > objectData.reachFree ? rF : 0;
    if(objectData.isBefouled) paradoxReachBonus += Math.floor((actorData.mage_traits.gnosis.final+1) / 2);
    let paradoxSleeperBonus = objectData.paradox.sleeper_witnesses === "None" ? 0 : 1;
    let paradoxInuredBonus = objectData.isInured ? 2 : 0;
    let paradoxToolPenalty = objectData.paradox.magical_tool_used ? 2 : 0;

    objectData.paradox.value = Math.max(0,objectData.paradox.previous_rolls + paradoxReachBonus + paradoxSleeperBonus + paradoxInuredBonus + objectData.paradox.bonus - paradoxToolPenalty - objectData.paradox.mana_spent);
    if(objectData.paradox.bonus>=0) {
      if(objectData.paradox.value < 1 && objectData.paradox.previous_rolls + paradoxReachBonus + paradoxSleeperBonus + paradoxInuredBonus + objectData.paradox.bonus > 0) objectData.paradox.chance_die = true;
      else objectData.paradox.chance_die = false;
    }
    else {
      if(objectData.paradox.value < 1 && objectData.paradox.previous_rolls + paradoxReachBonus + paradoxSleeperBonus + paradoxInuredBonus > 0) objectData.paradox.chance_die = true;
      else objectData.paradox.chance_die = false;
    }
    
    // Define available Attainments
    data.attainment_conditionalDuration = actorData.arcana_subtle.fate.value >= 2 ? true : false;
    data.attainment_preciseForce = actorData.arcana_gross.forces.value >= 2 ? true : false;
    data.attainment_permanence = (actorData.arcana_gross.matter.value  >= 2) && (arcanumName === "matter") ? true : false;
    data.attainment_sympatheticRange = actorData.arcana_gross.space.value >= 2 ? true : false;
    data.attainment_temporalSympathy = actorData.arcana_gross.time.value >= 2 ? true : false;
    data.attainment_everywhere = actorData.arcana_gross.space.value >= 4 ? true : false;
    data.attainment_timeInABottle = actorData.arcana_gross.time.value >= 4 ? true : false;

    return data;
  }
  
  activateListeners(html) {
    super.activateListeners(html);
    
    html.find('.rollParadox').click(ev => {
      const data = this.getData();
      this._rollParadox(data.object);
    });
    
    html.find('.castSpell').click(ev => {
      const data = this.getData();
      this._castSpell(data.object);
    });
  }

  async _updateObject(event, formData){
    event.preventDefault();
    const actorData = this.actor.system;
    const formElement = $(event.target).closest('form');
    
    // 1. Get old data
    let data = this.getData().object;

    const dicePool_old = data.spellcastingDice;
    const reach_old = data.reach;
    const reachFree_old = data.reachFree;
    const mana_old = data.manaCost;
    const paradox_old = data.paradox.value;
    const sleeper_old = data.paradox.sleeper_witnesses;
    const grimoire_old = data.castGrimoire || data.castRoteOwn;
    const isAnyMage = actorData.characterType === "Mage" || actorData.characterType === "Scelesti";
    
    // 2. Correct form data
    formData = Object.keys(formData).reduce( (a,key) => { a[key.split('.').slice(1).join('.')] = formData[key]; return a; } ,{});

    const arcanumName = formData["arcanum"];
    let arcanum = actorData.arcana_gross.hasOwnProperty(arcanumName) ? actorData.arcana_gross[arcanumName].value : actorData.arcana_subtle[arcanumName].value;  

    formData["reachFree"] = isAnyMage ? arcanum - formData["level"] + 1 : 1;
    if(formData["castGrimoire"]){
      formData["casting_time.isAdvanced"] = false;
    } 
    
    if(formData["attainment_permanence"]) formData["duration.isAdvanced"] = true;
    if(formData["attainment_everywhere"]) formData["scale.isAdvanced"] = true;
    if(formData["attainment_timeInABottle"]) formData["casting_time.isAdvanced"] = true;
    if(formData["attainment_sympatheticRange"] || formData["attainment_temporalSympathy"]) formData["range.isAdvanced"] = true;

    ["potency","duration","scale","casting_time","range"].forEach(factor => {
      //let index = $('select[name ="object.data.'  + factor + '.value"]')[0].selectedIndex;
      let ele = $(formElement).find('select[name ="object.'  + factor + '.value"]')[0];
      let index = ele ? ele.selectedIndex : 0;
      let value = undefined;
      const configData = CONFIG.MTA.spell_casting[factor];
      if(formData[factor + '.isAdvanced']){
        value = index >= configData.advanced.length ?  configData.advanced[configData.advanced.length-1] : configData.advanced[index];
      } 
      else if(factor==="casting_time") {
        let castArray = [];
        let baseCastingTime = isAnyMage ? CONFIG.MTA.spell_casting.casting_time.standard[Math.max(0,Math.floor((actorData.mage_traits.gnosis.final-1) / 2))]: "5 hours";
        baseCastingTime = baseCastingTime.split(" ");
        if(formData["castGrimoire"]) baseCastingTime[0] *= 2;
        for(let i = 0; i < 6; i++){
          castArray[i] = baseCastingTime[0]*(i+1) + " " + (i > 0 ? (baseCastingTime[1].charAt(baseCastingTime[1].length-1) != "s"  ? baseCastingTime[1] + 's' : baseCastingTime[1]) : baseCastingTime[1]);
        }
        value = index >= castArray.length ? castArray[data.casting_time.length-1] : castArray[index];
      }
      else value = index >= configData.standard.length ? configData.standard[configData.standard.length-1] : configData.standard[index];
      formData[factor + '.value'] = value;
    });
    
    if(formData["potency.value"] < formData["withstandRating"]+1) this.valueChange.potency = true;
    else this.valueChange.potency = false;
    formData["potency.value"] = Math.max(formData["potency.value"], formData["withstandRating"]+1);

    if(sleeper_old !== formData["paradox.sleeper_witnesses"]) { //Only change dice qualities when values change, so they're not unchangeable
      const sleepers = formData["paradox.sleeper_witnesses"];
      
      if(sleepers === "One" || sleepers === "None") {
        formData["paradox_eightAgain"] = false;
        formData["paradox_nineAgain"] = false;
        formData["paradox_tenAgain"] = true;
        formData["paradox_roteQuality"] = false;
      }
      else if(sleepers === "A few") {
        formData["paradox_eightAgain"] = false;
        formData["paradox_nineAgain"] = true;
        formData["paradox_tenAgain"] = false;
        formData["paradox_roteQuality"] = false;
      }
      else if(sleepers === "Large group") {
        formData["paradox_eightAgain"] = true;
        formData["paradox_nineAgain"] = false;
        formData["paradox_tenAgain"] = false;
        formData["paradox_roteQuality"] = false; 
      }
      else if(sleepers === "Full crowd") {
        formData["paradox_eightAgain"] = true;
        formData["paradox_nineAgain"] = false;
        formData["paradox_tenAgain"] = false;
        formData["paradox_roteQuality"] = true;
      }
    }
    
    if(formData["paradox.value"] < 1)  formData["paradox_tenAgain"] = false;
    else formData["paradox_tenAgain"] = true;

    if(grimoire_old !== (formData["castGrimoire"] || formData["castRoteOwn"])){
      if(!(formData["castGrimoire"] || formData["castRoteOwn"])) formData["spell_roteQuality"] = false;
      else formData["spell_roteQuality"] = true;
    }

    // 3. Update data with form data
    mergeObject(this.object.system, expandObject(formData, 5), {inplace: true});

    // 4. Get dependant data to find differences
    data = this.getData().object;

    if(data.spellcastingDice < 1) this.object.spell_tenAgain = false;
    else this.object.spell_tenAgain = true;
    
    if(dicePool_old !== data.spellcastingDice) this.valueChange.dicePool = true;
    else this.valueChange.dicePool = false;
    if(reach_old !== data.reach) this.valueChange.reach = true;
    else this.valueChange.reach = false;
    if(reachFree_old !== data.reachFree) this.valueChange.reachFree = true;
    else this.valueChange.reachFree = false;
    if(mana_old !== data.manaCost) this.valueChange.manaCost = true;
    else this.valueChange.manaCost = false;
    if(paradox_old !== data.paradox.value || sleeper_old !== data.paradox.sleeper_witnesses) this.valueChange.paradox = true;
    else this.valueChange.paradox = false;

    this.render();
  }

   /* Chat and Roll functions */
  
  /* Rolls the paradox roll separately if the user wishes. */
  async _rollParadox(spell){
    
    if(spell.paradox.value > 0 || spell.paradox.chance_die){
      //Paradox roll  
      this.paradoxRolled = true;
      DiceRollerDialogue.rollToChat({dicePool: spell.paradox.value, tenAgain: spell.paradox_tenAgain, nineAgain: spell.paradox_nineAgain, eightAgain: spell.paradox_eightAgain, roteAction: spell.paradox_roteQuality, flavor: "Paradox Roll"});
    }
    if(spell.isBefouled) {
      DiceRollerDialogue.rollToChat({dicePool: this.actor.system.mage_traits.gnosis.final, tenAgain: true, nineAgain: false, eightAgain: false, roteAction: false, flavor: "Controlled Paradox"});
    }
  }
  
  /* Rolls the spell and sends the result to chat. */
  async _castSpell(spell){
    const spellData = spell;
    spell = this.object; // FIXME: Lazy..
    //Use Mana
    const actorData = this.actor.system;
    let manaDiff = actorData.mana.value-spellData.manaCost;
    if(manaDiff >= 0) this.actor.update({"system.mana.value": actorData.mana.value-spellData.manaCost});
    else {
      ui.notifications.info("Not enough mana!");
      return;
    }
    if(spellData.spellcastingDice < -4) {
      ui.notifications.info("Spell fails!");
      return;
    }
    
     // Basic template rendering data
    const token = this.actor.token;
    if(!spell.img || spell.img === "icons/svg/item-bag.svg" || spell.img.startsWith('systems/mta/icons/placeholders')) {
      let img = CONFIG.MTA.placeholders.get(spellData.arcanum);
      if(!img) img = CONFIG.MTA.placeholders.get("magic");
      if(img) spell.img = img;
    }
    if(!spellData.description) spellData.description = "";
    const templateData = {
      item: spell,
      actor: this.actor,
      tokenId: token ? (token.scene ? `${token.scene.id}.${token.id}` : `${token.id}`) : null,
      isSpell: true,
      data: await this.getChatData(spellData)
    };

    // Render the chat card template
    const template = `systems/mta/templates/chat/item-card.html`;
    const html = await renderTemplate(template, templateData);
    let rolls = templateData.data.rolls.map(a => a.rollReturn.roll);
    const pool = PoolTerm.fromRolls(rolls);
    let roll = Roll.fromTerms([pool]);
   
    // Basic chat message data
    let chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      content: html,
      speaker: ChatMessage.getSpeaker({actor: this.actor, token: this.actor.token}),
      flavor: "Spellcasting - Level " + spellData.level + " " + spellData.arcanum + " (" + spellData.practice + ")",
      sound: CONFIG.sounds.dice,
      roll: roll
    };

    // Toggle default roll mode
    let rollMode = game.settings.get("core", "rollMode");
    chatData = ChatMessage.applyRollMode(chatData, rollMode);

    // Create the chat message
    return ChatMessage.create(chatData);
  }
  
  /* Rolls the spell, and the paradox, if that hasn't been rolled yet. */
  async _rollSpell(spell){
    let spellHtml, paradoxHtml, paradoxControlHtml;
    let spellReturn = {}, paradoxReturn ={}, paradoxControlReturn = {};

    //Spell casting roll
    spellHtml = await DiceRollerDialogue.rollToHtml({dicePool: spell.spellcastingDice, tenAgain: spell.spell_tenAgain, nineAgain: spell.spell_nineAgain, eightAgain: spell.spell_eightAgain, roteAction: spell.spell_roteQuality, exceptionalTarget: spell.castPraxis ? 3 : 5, flavor: "", rollReturn: spellReturn});
    
    if((spell.paradox.value > 0 || spell.paradox.chance_die) && !this.paradoxRolled){
      //Paradox roll  
      paradoxHtml = await DiceRollerDialogue.rollToHtml({dicePool: spell.paradox.value, tenAgain: spell.paradox_tenAgain, nineAgain: spell.paradox_nineAgain, eightAgain: spell.paradox_eightAgain, roteAction: spell.paradox_roteQuality, flavor: "", rollReturn: paradoxReturn});
    }

    if(spell.isBefouled && !this.paradoxRolled) {
      paradoxControlHtml = await DiceRollerDialogue.rollToHtml({dicePool: this.actor.system.mage_traits.gnosis.final, tenAgain: true, nineAgain: false, eightAgain: false, roteAction: false, exceptionalTarget: 5, flavor: "", rollReturn: paradoxControlReturn});
    }
    this.paradoxRolled = false;
    let rollTemplate = [];

    rollTemplate.push({
      html: spellHtml,
      title: "Spellcasting",
      rollReturn: spellReturn
    });
    if(paradoxHtml) rollTemplate.push({
      html: paradoxHtml,
      title: "Paradox",
      rollReturn: paradoxReturn
    });
    if(paradoxControlHtml) rollTemplate.push({
      html: paradoxControlHtml,
      title: "Controlled Paradox",
      rollReturn: paradoxControlReturn
    });
                                    
    return rollTemplate;
  }
  
  /**
   * Prepare an object of chat data used to display a card for the Item in the chat log
   * @return {Object}               An object of chat data to render
   */
  async getChatData(spell) {
    const data = duplicate(spell); // FIXME: WTF is this??
    data.data = this.getData();
    let secrets = false;
    if (this.actor) secrets = this.actor.isOwner;
    if (game.user.isGM) secrets = true;
    
    // Rich text description
    data.description = await TextEditor.enrichHTML(data.description, {secrets:secrets, entities:true, async: false});
    data.rolls = await this._rollSpell(spell);
    data.modifiers = [];
    if(spell.castRote) data.modifiers.push("Rote");
    if(spell.castPraxis) data.modifiers.push("Praxis");
    if(spell.isInured) data.modifiers.push("Inured");
    if(spell.castRoteOwn) data.modifiers.push("Self-created Rote");
    if(spell.castGrimoire) data.modifiers.push("Grimoire");
    if(spell.isBefouled) data.modifiers.push("Befouled");
    data.spellFactors = [
      {name: "Potency", value: data.potency.value, advanced: data.potency.isAdvanced, advString: data.potency.isAdvanced ? "(+2 withstand against dispell)" : ""},
      {name: "Duration", value: data.duration.value, advanced: data.duration.isAdvanced, advString: data.condition ? (data.condition !== "No condition" ? "(" + data.condition + ")" : "") : ""},
      {name: "Scale", value: data.scale.value, advanced: data.scale.isAdvanced, advString: ""},
      {name: "Casting Time", value: data.casting_time.value, advanced: data.casting_time.isAdvanced, advString: ""},
      {name: "Range", value: data.range.value, advanced: data.range.isAdvanced, advString: "" + (spell.attainment_sympatheticRange ? "[Symp. Range] " : "") + (spell.attainment_temporalSympathy ? "[Temporal Symp.]" : "") }
    ];
    if(data.additionalReach) data.spellFactors.push({name: "Extra Reach", value: data.additionalReach, advanced: false, advString: ""});
    data.information = [];
    const boni = data.data.object.bonusDice + data.data.castingTimePenalty + data.data.object.yantraBonus;
    const penalties = data.data.potencyPenalty + data.data.durationPenalty + data.data.scalePenalty + data.data.object.woundPenalty;
    data.information.push({name: "Dice", value: `${data.data.object.diceBase} (base) + ${boni} (boni) - ${penalties} (mali)`});
    data.information.push({name: "Reach", value: `${data.data.object.reach}/${data.data.object.reachFree}`});
    if(data.withstand) data.information.push({name: "Withstand", value: data.withstand});
    if(data.paradox.previous_rolls) data.information.push({name: "Paradox rolls (scene)", value: data.paradox.previous_rolls});
    if(data.data.object.manaCost) data.information.push({name: "Mana", value: data.data.object.manaCost});

    // Item type specific properties
    return data;
  }

  /** Helper Functions */
  
  /* This function returns the index in the config for a spell factor with which to calculate penalties*/
  _findFactorIndex(factor, objectData){
    let foundIndex = -1;
    if(!objectData[factor].isAdvanced){
      foundIndex =  CONFIG.MTA.spell_casting[factor].standard.findIndex(element => {
        return element == objectData[factor].value;
      });
    }
    else{
      foundIndex =  CONFIG.MTA.spell_casting[factor].advanced.findIndex(element => {
        return element === objectData[factor].value;
      });
    }
    return foundIndex;
  }
  
  /* This function calculates the dice penalty for a spell factor */
  _calculateFactorPenalty(factor, isPrimary, arcanumRating, objectData, bonus=0){
    let foundIndex = this._findFactorIndex(factor, objectData);
    return foundIndex === -1 ? 999 : (isPrimary ? Math.max(0,(foundIndex-arcanumRating+1-bonus))*2 : Math.max(0,(foundIndex-bonus))*2);
  }
  
  /* This function calculates the penalty for casting time, which works slightly differently */
  _calculateCastingTimePenalty(arcanumRating, objectData,data){
    let foundIndex = -1;
    if(!objectData.casting_time.isAdvanced){
      foundIndex =  data.casting_time.findIndex(element => {
        return element == objectData.casting_time.value;
      });
    }
    else {
      foundIndex =  CONFIG.MTA.spell_casting.casting_time.advanced.findIndex(element => {
        return element === objectData.casting_time.value;
      });
    }
    return foundIndex;
  }

}