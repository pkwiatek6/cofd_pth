import {
  DiceRollerDialogue
} from "./dialogue-diceRoller.js";
import {
  ImprovisedSpellDialogue
} from "./dialogue-improvisedSpell.js";
/**
 * Override and extend the basic :class:`Actor` implementation
 */
export class ActorMtA extends Actor {

  /* -------------------------------------------- */
  /*	Data Preparation														*/
  /* -------------------------------------------- */

  /**
   * Augment the basic Actor data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();


    // Get the Actor's data object
    const systemData = this.system;

    if (!systemData.derivedTraits) systemData.derivedTraits = {
      size: { value: 0, mod: 0 },
      speed: { value: 0, mod: 0 },
      defense: { value: 0, mod: 0 },
      armor: { value: 0, mod: 0 },
      ballistic: { value: 0, mod: 0 },
      initiativeMod: { value: 0, mod: 0 },
      perception: { value: 0, mod: 0 },
      health: { value: 0, mod: 0 }
    };

    //Get modifiers from items
    let item_mods = this.items.reduce((acc, item) => {
      if (item.system.equipped) {
        if (item.system.initiativeMod) acc.initiativeMod += item.system.initiativeMod;
        if (item.type === "armor") acc.armor += item.system.rating;
        if (item.type === "armor") acc.ballistic += item.system.ballistic;
        if (item.system.defensePenalty) acc.defense -= item.system.defensePenalty;
        if (item.system.speedPenalty) acc.speed -= item.system.speedPenalty;
      }
      return acc;
    }, {
      initiativeMod: 0,
      defense: 0,
      speed: 0,
      armor: 0,
      ballistic: 0
    });

    let attributes = [];
    if (this.type === "character") {
      attributes = [
        systemData.attributes_physical,
        systemData.attributes_mental,
        systemData.attributes_social,
        systemData.skills_physical,
        systemData.skills_social,
        systemData.skills_mental,
        systemData.derivedTraits,
        systemData.attributes_physical_dream,
        systemData.attributes_mental_dream,
        systemData.attributes_social_dream,
        systemData.mage_traits,
        systemData.vampire_traits,
        systemData.werewolf_traits,
        systemData.changeling_traits,
        systemData.demon_traits,
        systemData.princess_traits,
        systemData.arcana_subtle,
        systemData.arcana_gross
      ];
    }
    else if (this.type === "ephemeral") {
      attributes = [systemData.eph_physical, systemData.eph_mental, systemData.eph_social, systemData.derivedTraits];
    }

    attributes.forEach(attribute => Object.values(attribute).forEach(trait => {
      //if(trait == undefined) console.warn("Null attribute found", attribute, this.name)
      if (trait == undefined) trait = {};
      if (typeof trait == 'number') trait = {}; // Quick fix for a mistake I made for dream stats
      trait.final = trait.value;
      trait.raw = undefined;
      trait.isModified = false;
    }));

    const der = systemData.derivedTraits;

    let derivedTraitBuffs = [];
    let itemBuffs = [];

    //Get effects from items (modifiers to any attribute/skill/etc.)
    for (let i of this.items) {
      if (i.system?.effects && (i.system?.effectsActive || i.system?.equipped)) { // only look at active effects
        if (i.type === "form" && this.system.characterType !== "Werewolf") continue; // Forms only work for werewolves
        itemBuffs = itemBuffs.concat(i.system.effects);
      }
    }

    for (let i of this.items) {
      if (i.system?.effects && (i.system?.effectsActive || i.system?.equipped)) { // only look at active effects
        if (i.type === "regalia" && this.system.characterType !== "Princess") continue; // regalia only work for princesses
        itemBuffs = itemBuffs.concat(i.system.effects);
      }
    }

    itemBuffs.filter(e => e.name.split('.')[0] !== "derivedTraits").sort((a, b) => (b.value < 0) - (a.value < 0) || (!!a.overFive) - (!!b.overFive)).forEach(e => {
      const trait = e.name.split('.').reduce((o, i) => {
        if (o != undefined && o[i] != undefined) return o[i];
        else return undefined;
      }, systemData);
      if (trait != undefined) {
        if (typeof trait == 'number') {
          if (ui?.notifications) ui.notifications.warn(`CofD: The trait does not support the effect system at the moment: ${e.name}`);
          console.warn("CofD: The trait does not support the effect system at the moment. " + e.name);
          return;
        }
        const newVal = (Number.isInteger(trait.raw) ? trait.raw : trait.value) + e.value;
        trait.raw = e.overFive ? newVal : Math.min(newVal, Math.max(trait.value, this.getTraitMaximum()));
        trait.final = Math.clamped(trait.raw, 0, Math.max(trait.value, CONFIG.MTA.traitMaximum));
        trait.isModified = true;
      }
      else {
        if (ui?.notifications) ui.notifications.warn(`CofD: The trait does not support the effect system at the moment: ${e.name}`);
        console.warn("CofD: The trait does not support the effect system at the moment. " + e.name, this.name);
        return;
      }
    });
    derivedTraitBuffs.push(...itemBuffs.filter(e => e.name.split('.')[0] === "derivedTraits"));

    // Compute derived traits
    if (this.type === "character") {
      const str = systemData.attributes_physical.strength.final;
      const dex = systemData.attributes_physical.dexterity.final;
      const wit = systemData.attributes_mental.wits.final;
      const comp = systemData.attributes_social.composure.final;

      if (systemData.isDreaming) {
        der.speed.final = 5 + systemData.attributes_physical_dream.power.final + systemData.attributes_social_dream.finesse.final;
        der.defense.final = Math.min(systemData.attributes_physical_dream.power.final, systemData.attributes_social_dream.finesse.final);
        der.initiativeMod.final = systemData.attributes_social_dream.finesse.final + systemData.attributes_mental_dream.resistance.final + der.initiativeMod.mod + item_mods.initiativeMod;

        let newMax = 0;
        if (systemData.characterType === "Changeling") newMax = systemData.clarity.value;
        else newMax = systemData.attributes_mental_dream.resistance.final;

        //  Add Gnosis/Wyrd derived maximum
        if (systemData.characterType === "Mage" || systemData.characterType === "Scelesti") newMax += Math.max(5, systemData.mage_traits.gnosis.final);
        else if (systemData.characterType === "Changeling") newMax += Math.max(5, systemData.changeling_traits.wyrd.final);
        else newMax += 5;
        der.health.value = newMax;
      }
      else {
        der.speed.value = 5 + str + dex;
        der.defense.value = Math.min(wit, dex) + this._getDefenseSkill();
        der.initiativeMod.value = comp + dex;
        der.health.value = systemData.attributes_physical.stamina.final;
      }
      der.perception.value = comp + wit + this.getClarityBonus();
    }
    else if (this.type === "ephemeral") {
      der.speed.value = 5 + systemData.eph_physical.power.final + systemData.eph_social.finesse.final;
      der.defense.value = (systemData.rank > 1 ? Math.min(systemData.eph_physical.power.final, systemData.eph_social.finesse.final) : Math.max(systemData.eph_physical.power.final, systemData.eph_social.finesse.final));
      der.initiativeMod.value = systemData.eph_social.finesse.final + systemData.eph_mental.resistance.final;
      der.perception.value = systemData.eph_social.finesse.final + systemData.eph_mental.resistance.final;
      der.health.value = systemData.eph_mental.resistance.final;
    }

    der.size.value = 5 + der.size.mod;
    der.armor.value = der.armor.mod + item_mods.armor;
    der.ballistic.value += der.ballistic.mod + item_mods.ballistic;

    der.speed.value += der.speed.mod + item_mods.speed;
    der.defense.value += der.defense.mod + item_mods.defense;
    der.initiativeMod.value += der.initiativeMod.mod + item_mods.initiativeMod;
    der.perception.value += der.perception.mod;
    der.health.value += der.health.mod;

    [systemData.derivedTraits].forEach(attribute => Object.values(attribute).forEach(trait => {
      trait.final = trait.value;
      trait.raw = undefined;
      trait.isModified = false;
    }));

    // Apply derived Traits buffs
    derivedTraitBuffs.forEach(e => {
      const trait = e.name.split('.').reduce((o, i) => o[i], systemData);
      trait.raw = Number.isInteger(trait.raw) ? trait.raw + e.value : trait.value + e.value;
      trait.final = Math.max(trait.raw, 0);
      trait.isModified = true;
    });

    if (!systemData.isDreaming) der.health.final += der.size.final;

    der.size.final = Math.max(0, der.size.final);
    der.speed.final = Math.max(0, der.speed.final);
    der.defense.final = Math.max(0, der.defense.final);
    der.armor.final = Math.max(0, der.armor.final);
    der.ballistic.final = Math.max(0, der.ballistic.final);
    der.initiativeMod.final = Math.max(0, der.initiativeMod.final);
    der.perception.final = Math.max(0, der.perception.final);

    // Get current demon cover
    if (systemData.characterType === "Demon") {
      systemData.currentCover = 0;
      for (let actorItem of this.items) {
        if (actorItem.type == "cover" && actorItem.system.isActive) {
          systemData.currentCover = actorItem.system.rating;
          systemData.currentCoverName = actorItem.name;
          break;
        }
      }
    }
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
  /* -------------------------------------------- */

  /** @override */
  _preCreate(data, user) {
    super._preCreate(data, user);

    const tokenUpdateData = {};
    if (data.prototypeToken?.actorLink === undefined) {
      tokenUpdateData["actorLink"] = true;
    }

    if (!foundry.utils.isEmpty(tokenUpdateData)) this.prototypeToken.updateSource(tokenUpdateData);
  }



  /** @override */
  static async create(data, options = {}) {
    const actor = await super.create(data, options);
    if (actor.type === "character") await actor.createWerewolfForms();

    return actor;
  }

  /**
   * Rolls a set of dice and calculates a result based on the provided traits and bonuses.
   *
   * @param {object} params - The parameters for the roll.
   * @param {string[]} [params.traits=[]] - An array of strings in the format "<trait-group>.<trait>", e.g. ["attributes_physical.strength", "skills_social.persuasion"])..
   * @param {number} [params.diceBonus=0] - A bonus to add to the dice roll.
   * @param {string} [params.rollName="Skill check"] - The name of the roll.
   * @param {string} [params.rollType="dialogue"] - The type of roll, either "dialogue" or "quick".
   *
   * @returns {number} The result of the roll.
   */
  roll({ traits = [], diceBonus = 0, rollName = "Skill check", rollType = "dialogue", damageRoll = false }) {

    const { dicePool, flavor } = this.assembleDicePool({ traits, diceBonus });

    switch (rollType) {
      case 'dialogue':
        let title = "";
        title = rollName + ": " + flavor;
        let diceRoller = new DiceRollerDialogue({ dicePool, flavor: title, addBonusFlavor: true, title, actorOverride: this.actor });
        diceRoller.render(true);
        break;
      case 'quick':
        DiceRollerDialogue.rollToChat({
          dicePool,
          flavor,
          actorOverride: this.actor
        });
        break;
      default:
        return { flavor, dicePool };
    }
    // TODO: Return result of the roll

  }


  /**
   * Assembles a dice pool from an array of traits into a concrete number,
   * alongside the flavor text describing the assembled dice pool.
   *
   * @param {object} params - The parameters for the roll.
   * @param {string[]} [params.traits=[]] - An array of strings in the format "<trait-group>.<trait>", e.g. ["attributes_physical.strength", "skills_social.persuasion"])..
   * @param {number} [params.diceBonus=0] - A bonus to add to the dice roll.
   *
   * @returns {object} An object containing a dice pool and a flavor string.
   * @property {number} dicePool - The assembled dice pool as a number.
   * @property {string} flavor - A string representing the contents of the dice pool.
   */
  assembleDicePool({ traits = [], diceBonus = 0 }) {
    const systemData = this.system;

    //Get dice pool
    let dicePool = 0;
    let flavor = "";

    if (traits.length > 0) {
      // Get dice pool according to the item's dice pool attributes from the actor
      let diceFromTraits = traits ? traits.reduce((acc, cur) => {

        let ret = 0;
        let flv = "";
        ret = cur.split('.').reduce((o, i) => {
          if (o != undefined && o[i] != undefined) return o[i];
          else return undefined;
        }, systemData);

        if (!Number.isInteger(ret)) {
          if (typeof ret.max == 'number') ret = ret.max; // E.g. Willpower, ..
          else if (typeof ret.final == 'number') ret = ret.final;
          else if (typeof ret.value == 'number') ret = ret.value;
          else {
            ret = 0;
            console.warn("CofD: A roll attribute could not be resolved. " + cur);
          }
        }
        if (cur.split('.')[0] === "disciplines_own") flv = cur.split('.').reduce((o, i) => o[i], systemData).label;
        if (cur.split('.')[0] === "invocation_own") flv = cur.split('.').reduce((o, i) => o[i], systemData).label;
        else flv = game.i18n.localize("MTA." + cur);

        // Apply penalty if character has 0 in a skill
        const skillType = cur.split('.')[0];
        if ((skillType === "skills_physical" || skillType === "skills_social") && ret <= 0) {
          flv += " (unskilled)";
          ret -= 1;
        } else if (skillType === "skills_mental" && ret <= 0) {
          flv += " (unskilled)";
          ret -= 3;
        }

        if (flavor) flavor += " + " + flv;
        else flavor = flv;
        return acc + ret;
      }, 0) : 0;
      dicePool += diceFromTraits;
    }
    else flavor = "Skill Check";
    if (diceBonus) {
      dicePool += diceBonus;
      flavor += diceBonus >= 0 ? ' (+' : ' (';
      flavor += diceBonus + ' bonus)';
    }

    let woundPenalty = this.getWoundPenalties();

    if (woundPenalty > 0) {
      dicePool -= woundPenalty;
      flavor += " (Wound penalties: -" + woundPenalty + ")";
    }

    return { dicePool, flavor };
  }

  /**
   * Creates the 5 standard werewolf forms for the actor, and
   * deletes all existing forms.
   */
  async createWerewolfForms() {
    //Add the 5 basic werewolf forms
    const itemData = [
      {
        name: "Hishu",
        type: "form",
        img: "systems/mta/icons/forms/Hishu.svg",
        data: {
          subname: "Human",
          effects: [
            { name: "derivedTraits.perception", value: 1, overFive: true }
          ],
          description_short: "Sheep's Clothing",
          description: "",
          effectsActive: true
        }
      },
      {
        name: "Dalu",
        type: "form",
        img: "systems/mta/icons/forms/Dalu.svg",
        data: {
          subname: "Near-Human",
          effects: [
            { name: "attributes_physical.strength", value: 1, overFive: true },
            { name: "attributes_physical.stamina", value: 1, overFive: true },
            { name: "attributes_social.manipulation", value: -1, overFive: true },
            { name: "derivedTraits.size", value: 1, overFive: true },
            { name: "derivedTraits.perception", value: 2, overFive: true }
          ],
          description_short: "Teeth/Claws +0L\nDefense vs. Firearms\nMild Lunacy\nBadass Motherfucker",
          description: ""
        }
      },
      {
        name: "Gauru",
        type: "form",
        img: "systems/mta/icons/forms/Gauru.svg",
        data: {
          subname: "Wolf-Man",
          effects: [
            { name: "attributes_physical.strength", value: 3, overFive: true },
            { name: "attributes_physical.dexterity", value: 1, overFive: true },
            { name: "attributes_physical.stamina", value: 2, overFive: true },
            { name: "derivedTraits.size", value: 2, overFive: true },
            { name: "derivedTraits.perception", value: 3, overFive: true }
          ],
          description_short: "Teeth/Claws +2L\n(Initiative +3)\nDefense vs. Firearms\nFull Lunacy\nRegeneration\nRage\nPrimal Fear",
          description: ""
        }
      },
      {
        name: "Urshul",
        type: "form",
        img: "systems/mta/icons/forms/Urshul.svg",
        data: {
          subname: "Near-Wolf",
          effects: [
            { name: "attributes_physical.strength", value: 2, overFive: true },
            { name: "attributes_physical.dexterity", value: 2, overFive: true },
            { name: "attributes_physical.stamina", value: 2, overFive: true },
            { name: "attributes_social.manipulation", value: -1, overFive: true },
            { name: "derivedTraits.size", value: 1, overFive: true },
            { name: "derivedTraits.speed", value: 3, overFive: true },
            { name: "derivedTraits.perception", value: 3, overFive: true }
          ],
          description_short: "Teeth +2L/Claws +1L\nDefense vs. Firearms\nModerate Lunacy\nWeaken the Prey",
          description: ""
        }
      },
      {
        name: "Urhan",
        type: "form",
        img: "systems/mta/icons/forms/Urhan.svg",
        data: {
          subname: "Wolf",
          effects: [
            { name: "attributes_physical.dexterity", value: 2, overFive: true },
            { name: "attributes_physical.stamina", value: 1, overFive: true },
            { name: "attributes_social.manipulation", value: -1, overFive: true },
            { name: "derivedTraits.size", value: -1, overFive: true },
            { name: "derivedTraits.speed", value: 3, overFive: true },
            { name: "derivedTraits.perception", value: 4, overFive: true }
          ],
          description_short: "Teeth +1L\nChase Down",
          description: ""
        }
      }
    ];
    let oldForms = this.items.filter(item => item.type === "form").map(item => item.id);
    if (oldForms) await this.deleteEmbeddedDocuments("Item", oldForms);
    await this.createEmbeddedDocuments("Item", itemData);
  }

  /**
   * @deprecated
   * This function returns the actual, modified value for any attribute or skill.
   * and should be used whenever someone rolls.
   * Final is the modified trait, and value is the base.
   * Do not use this for derived traits! They do not have value or final fields.
   */
  static getTrait(trait) {
    console.warn("CofD system: The getTrait() function has been deprecated. Please simply use trait.final instead.")
    return trait.final;
  }

  //Search for Merit Defensive Combat
  _getDefenseSkill() {
    if (game.settings.get("mta", "lowerDefense")) return 0;
    const systemData = this.system;

    const hasBrawlMerit = this.items.find(ele => {
      return ele.name === "Defensive Combat (Brawl)" && ele.type === "merit";
    });
    let hasWeaponryMerit = this.items.find(ele => {
      return ele.name === "Defensive Combat (Weaponry)" && ele.type === "merit";
    });
    if (hasWeaponryMerit) {
      hasWeaponryMerit = this.items.find(ele => {
        return ele.system.equipped && ele.type === "melee";
      });
    }

    const brawlSkill = hasBrawlMerit ? systemData.skills_physical.brawl.final : 0;
    const weaponrySkill = hasWeaponryMerit ? systemData.skills_physical.weaponry.final : 0;
    return Math.max(Math.max(brawlSkill, weaponrySkill), systemData.skills_physical.athletics.final);
  }

  /** Returns the attribute limit of the character (e.g. Gnosis for mages) **/
  getTraitMaximum() {
    const data = this.system;
    if (this.type === "ephemeral")
      return 999;

    const powerStats = { //TODO: Put in config
      Mortal: 5,
      Sleepwalker: 5,
      Mage: data.mage_traits.gnosis?.final,
      Scelesti: data.mage_traits.gnosis?.final,
      Proximi: 5,
      Vampire: data.vampire_traits.bloodPotency?.final,
      Changeling: data.changeling_traits.wyrd?.final,
      Werewolf: data.werewolf_traits.primalUrge?.final,
      Demon: data.demon_traits.primum?.final,
    };
    if (!powerStats[data.characterType]) {
      return 5;
    }
    return Math.max(5, powerStats[data.characterType]);
  }

  /**
   * Executes a perception roll using Composure + Wits.
   * if hidden is set, the roll is executed as a blind GM roll.
   */
  rollPerception(quickRoll, hidden, actorOverride) {
    const data = this.system;
    let dicepool = data.derivedTraits.perception.final;
    let flavor = "Perception";
    if (quickRoll) DiceRollerDialogue.rollToChat({
      dicePool: dicepool,
      flavor: flavor,
      title: flavor,
      blindGMRoll: hidden,
      actorOverride: actorOverride
    });
    else {
      let diceRoller = new DiceRollerDialogue({
        dicePool: dicepool,
        flavor: flavor,
        title: flavor,
        addBonusFlavor: true,
        blindGMRoll: true,
        actorOverride: actorOverride
      });
      diceRoller.render(true);
    }
  }


  damage(damageAmount, damagetype) {
    if (damageAmount === 0) return;
    console.log("Damaging " + this.name + " by " + damageAmount + " " + damagetype + " damage");
    if (damagetype === "bashing") damagetype = "value"

    if (this.system.health[damagetype] != undefined) {
      let updateData = {};
      if (damageAmount > 0) {
        if (damagetype === 'aggravated') {
          updateData[`data.health.aggravated`] = Math.max(0, this.system.health.aggravated - damageAmount);
          updateData[`data.health.lethal`] = Math.max(0, this.system.health.lethal - damageAmount);
          updateData[`data.health.value`] = Math.max(0, this.system.health.value - damageAmount);
        }
        else if (damagetype === 'lethal') {
          let carryOver_aggravated = - Math.min(0, this.system.health.lethal - damageAmount);

          if (carryOver_aggravated > 0) updateData[`data.health.aggravated`] = Math.max(0, this.system.health.aggravated - carryOver_aggravated);
          updateData[`data.health.lethal`] = Math.max(0, this.system.health.lethal - damageAmount);
          updateData[`data.health.value`] = Math.max(0, this.system.health.value - damageAmount);
        }
        else if (damagetype === 'value') {
          let carryOver_lethal = - Math.min(0, this.system.health.value - damageAmount);
          let carryOver_aggravated = - Math.min(0, this.system.health.lethal - carryOver_lethal);

          if (carryOver_aggravated > 0) updateData[`data.health.aggravated`] = Math.max(0, this.system.health.aggravated - carryOver_aggravated);
          if (carryOver_lethal > 0) updateData[`data.health.lethal`] = Math.max(0, this.system.health.lethal - damageAmount);
          updateData[`data.health.value`] = Math.max(0, this.system.health.value - damageAmount);
        }
      }
      else { // Negative damage == healing
        if (damagetype === 'value') updateData[`data.health.value`] = Math.min(this.system.health.lethal, this.system.health.value - damageAmount);
        else if (damagetype === 'lethal') {
          updateData[`data.health.lethal`] = Math.min(this.system.health.aggravated, this.system.health.lethal - damageAmount);
          updateData[`data.health.value`] = Math.min(updateData[`data.health.lethal`], this.system.health.value - damageAmount);
        }
        else if (damagetype === 'aggravated') {
          updateData[`data.health.aggravated`] = Math.min(this.system.health.max, this.system.health.aggravated - damageAmount);
          updateData[`data.health.lethal`] = Math.min(updateData[`data.health.aggravated`], this.system.health.lethal - damageAmount);
          updateData[`data.health.value`] = Math.min(updateData[`data.health.lethal`], this.system.health.value - damageAmount);
        }
      }

      this.update(updateData);
    }
  }

  getWoundPenalties() {
    const systemData = this.system;
    let woundPenalty = 0;
    if (systemData.health.value <= 3 && !(this.type === "ephemeral")) {
      woundPenalty = 2 - (systemData.health.value - 1);
      // Check for Iron Stamina Merit
      let ironStamina = this.items.find(item => item.type === "merit" && item.name === "Iron Stamina");
      if (ironStamina) woundPenalty = Math.max(0, woundPenalty - ironStamina.system.rating);
    }
    return woundPenalty;
  }

  // 
  /**
   * Gets the Perception bonus dependent on Clarity (only Changelings).
   * In contrast to wound getWoundPenalties, penalties here are negative.
   */
  getClarityBonus() {
    const systemData = this.system;
    if (systemData.characterType !== "Changeling") return 0;
    let clarity = systemData.clarity.value;
    let clarityMax = systemData.clarity.max;

    let diceBonus = (clarity < 3) ? -2 : (clarity < 5) ? -1 : 0;
    if (clarity === clarityMax) diceBonus += 2;
    if (clarity <= 0) diceBonus = -99;

    return diceBonus;
  }

  castSpell(spell) {
    const itemData = spell ? duplicate(spell.system) : {};
    if (spell) {
      if (spell.system.isRote) itemData.castRote = true;
      else if (spell.system.isPraxis) itemData.castPraxis = true;
    }

    let activeSpell = new CONFIG.Item.documentClass({
      data: mergeObject(game.system.model.Item["activeSpell"], itemData, {
        inplace: false
      }),
      name: spell ? spell.name : 'Improvised Spell',
      img: spell ? spell.img : '',
      type: "activeSpell"
    });

    activeSpell.img = spell ? spell.img : '';

    let spellDialogue = new ImprovisedSpellDialogue(activeSpell, this);
    spellDialogue.render(true);
  }

  /**
   * Executes a breaking point roll using Resolve + Composure.
   * if hidden is set, the roll is executed as a blind GM roll.
   */
  rollBreakingPoint(quickRoll, hidden) {
    const systemData = this.system;
    let dicepool = systemData.attributes_social.composure.final + systemData.attributes_mental.resolve.final;
    let penalty = systemData.integrity >= 8 ? 2 : systemData.integrity >= 6 ? 1 : systemData.integrity <= 1 ? -2 : systemData.integrity <= 3 ? -1 : 0;
    dicepool += penalty;
    let flavor = "Breaking Point: Resolve + Composure + " + penalty;
    if (quickRoll) DiceRollerDialogue.rollToChat({
      dicePool: dicepool,
      flavor: flavor,
      title: flavor,
      blindGMRoll: hidden
    });
    else {
      let diceRoller = new DiceRollerDialogue({
        dicePool: dicepool,
        flavor: flavor,
        title: flavor,
        addBonusFlavor: true,
        blindGMRoll: hidden
      });
      diceRoller.render(true);
    }
  }

  /**
   * Executes a dissonance roll using Integrity.
   * if hidden is set, the roll is executed as a blind GM roll.
   */
  rollDissonance(quickRoll, hidden) {
    const systemData = this.system;
    let dicepool = systemData.integrity;
    let flavor = "Dissonance: Integrity (withstood by spell dots, rank, soul stones, etc.)";
    if (quickRoll) DiceRollerDialogue.rollToChat({
      dicePool: dicepool,
      flavor: flavor,
      title: flavor,
      blindGMRoll: hidden
    });
    else {
      let diceRoller = new DiceRollerDialogue({
        dicePool: dicepool,
        flavor: flavor,
        title: flavor,
        addBonusFlavor: true,
        blindGMRoll: hidden
      });
      diceRoller.render(true);
    }
  }

  /**
   * Executes a cover compromise roll using Wits + Manipulation.
   * if hidden is set, the roll is executed as a blind GM roll.
   */
  rollCompromise(quickRoll, hidden) {
    const systemData = this.system;
    let dicepool = systemData.attributes_mental.wits.final + ata.attributes_social.manipulation.final;
    let penalty = systemData.currentCover >= 8 ? 2 : systemData.currentCover >= 6 ? 1 : systemData.currentCover <= 1 ? -2 : systemData.currentCover <= 3 ? -1 : 0;
    dicepool += penalty;
    let flavor = "Compromise: Wits + Manipulation + " + penalty;
    if (quickRoll) DiceRollerDialogue.rollToChat({
      dicePool: dicepool,
      flavor: flavor,
      title: flavor,
      blindGMRoll: hidden
    });
    else {
      let diceRoller = new DiceRollerDialogue({
        dicePool: dicepool,
        flavor: flavor,
        title: flavor,
        addBonusFlavor: true,
        blindGMRoll: hidden
      });
      diceRoller.render(true);
    }
  }

  /**
   * Converts the character's stats into dream stats, 
   * depending on the template.
   */
  dreaming(unequipItems) {
    const systemData = this.system;
    const updateData = {};
    updateData['system.isDreaming'] = !systemData.isDreaming;
    if (updateData['system.isDreaming']) {
      // Start dreaming. Replace attributes and health.
      if (systemData.characterType === "Mage" || systemData.characterType === "Scelesti") updateData['system.attributes_physical_dream.power.value'] = Math.max(systemData.attributes_mental.intelligence.final, systemData.attributes_social.presence.final);
      else if (systemData.characterType === "Changeling") updateData['system.attributes_physical_dream.power.value'] = systemData.attributes_social.presence.final;
      else updateData['system.attributes_physical_dream.power.value'] = systemData.attributes_mental.intelligence.final;

      if (systemData.characterType === "Mage" || systemData.characterType === "Scelesti") updateData['system.attributes_social_dream.finesse.value'] = Math.max(systemData.attributes_mental.wits.final, systemData.attributes_social.manipulation.final);
      else if (systemData.characterType === "Changeling") updateData['system.attributes_social_dream.finesse.value'] = systemData.attributes_social.manipulation.final;
      else updateData['system.attributes_social_dream.finesse.value'] = systemData.attributes_mental.wits.final;

      if (systemData.characterType === "Mage" || systemData.characterType === "Scelesti") updateData['system.attributes_mental_dream.resistance.value'] = Math.max(systemData.attributes_mental.resolve.final, systemData.attributes_social.composure.final);
      else if (systemData.characterType === "Changeling") updateData['system.attributes_mental_dream.resistance.value'] = systemData.attributes_social.composure.final;
      else updateData['system.attributes_mental_dream.resistance.value'] = systemData.attributes_mental.resolve.final;

      // Slightly unusual: to make sure that token's health bars stll show the currently important health,
      // the normal health is backed up into dream_health, and health is replaced, instead of introducing
      // a new type of health as a new trait. Dream health is not backed up, as I believe that's not a thing.
      updateData['system.dream_health'] = systemData.health;
      let newMax = 0;
      if (systemData.characterType === "Changeling") newMax = systemData.clarity.value;
      else newMax = updateData['system.attributes_mental_dream.resistance.value'];

      //  Add Gnosis/Wyrd derived maximum
      if (systemData.characterType === "Mage" || systemData.characterType === "Scelesti") newMax += Math.max(5, systemData.mage_traits.gnosis.final);
      else if (systemData.characterType === "Changeling") newMax += Math.max(5, systemData.changeling_traits.wyrd.final);
      else newMax += 5;

      updateData['system.health'] = {
        max: newMax,
        lethal: newMax,
        aggravated: newMax,
        value: newMax
      }

    }
    else {
      // Dreaming ended. Reset health.
      if (systemData.dream_health) updateData['system.health'] = systemData.dream_health;
      let amnion = this.items.filter(item => item.name === "Amnion");
      if (amnion) this.deleteEmbeddedDocuments("Item", amnion.map(item => item.id));
    }
    if (unequipItems) {
      let equipped = this.items.filter(item => item.system.equipped);
      if (equipped) {
        this.updateEmbeddedDocuments("Item", equipped.map(item => {
          return {
            _id: item.id,
            'data.equipped': false
          }
        }));
      }
    }
    this.update(updateData);
  }

  /**
   * A mage macro which conjures the amnion (as an item)
   * and equips it.
   */
  callAmnion() {
    const itemData = {
      type: "condition",
      name: "Amnion",
      img: "systems/mta/icons/gui/macro-amnion.svg",
      'system.effectsActive': true,
      'system.effects': [
        {
          name: "derivedTraits.armor",
          value: Math.min(this.system.mage_traits.gnosis.final, Math.max(...Object.values(this.system.arcana_subtle).map(arcanum => arcanum.value)))
        },
        {
          name: "attributes_social_dream.finesse",
          value: -2
        },
        {
          name: "derivedTraits.defense",
          value: -1
        }
      ]
    }
    return this.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Prompts the user with a dialogue to enter name and beats to add
   * a progress entry to the actor.
   */
  addProgressDialogue() {
    let d = new Dialog({
      title: "Add Progress",
      content: "<div> <span> Name </span> <input class='attribute-value' type='text' name='input.name' placeholder='No Reason'/></div> <div> <span> Beats </span> <input class='attribute-value' type='number' name='input.beats' data-dtype='Number' min='0' placeholder='0'/></div> <div> <span> Arc. Beats </span> <input class='attribute-value' type='number' name='input.arcaneBeats' data-dtype='Number' min='0' placeholder='0'/></div>",
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: "OK",
          callback: html => {
            let name = html.find(".attribute-value[name='input.name']").val();
            if (!name) name = "No Reason";
            let beats = html.find(".attribute-value[name='input.beats']").val();
            if (!beats) beats = 0;
            let arcaneBeats = html.find(".attribute-value[name='input.arcaneBeats']").val();
            if (!arcaneBeats) arcaneBeats = 0;
            this.addProgress(name, beats, arcaneBeats);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "cancel"
    });
    d.render(true);
  }

  /**
   * Adds a progress entry to the actor, with given name and beats.
   */
  addProgress(name = "", beats = 0, arcaneBeats = 0) {
    const system = this.system;
    beats = Math.floor(beats);
    arcaneBeats = Math.floor(arcaneBeats);
    let progress = system.progress ? duplicate(system.progress) : [];
    progress.push({
      name: name,
      beats: beats,
      arcaneBeats: arcaneBeats
    });
    return this.update({
      'system.progress': progress
    });
  }

  /**
   * Removes a progress entry from the actor at a given position.
   * Note, that the first entry (__INITIAL__) is not part of the progress array;
   * the element coming after it has index 0.
   */
  removeProgress(index = 0) {
    const system = this.system;
    let progress = system.progress ? duplicate(system.progress) : [];
    progress.splice(index, 1);
    return this.update({
      'system.progress': progress
    });
  }

  /**
   * Calculates and sets the maximum health for the actor using the formula
   * Stamina + Size.
   * If health is set lower than any damage, the damage is lost.
   */
  calculateAndSetMaxHealth() {
    const system = this.system;
    const maxHealth_old = system.health.max;
    //let maxHealth = data.derivedTraits.size.final + data.attributes_physical.stamina.final;
    let maxHealth = system.derivedTraits.health.final;
    //if(data.characterType === "Vampire") maxHealth += data.disciplines.common.resilience.value;

    let diff = maxHealth - maxHealth_old;
    if (diff === 0) return;

    let updateData = {}
    updateData['system.health.max'] = maxHealth;

    if (diff >= 0) { // New health is more than old
      updateData['system.health.lethal'] = (+system.health.lethal + diff);
      updateData['system.health.aggravated'] = (+system.health.aggravated + diff);
      updateData['system.health.value'] = (+system.health.value + diff);
    } else { // New health is less than old
      updateData['system.health.lethal'] = Math.max(0, (+system.health.lethal + diff));
      updateData['system.health.aggravated'] = Math.max(0, (+system.health.aggravated + diff));
      updateData['system.health.value'] = Math.max(0, (+system.health.value + diff));

      if (system.health.lethal < Math.abs(diff)) { // Too much lethal damage, upgrade lethal to aggravated damage.
        updateData['system.health.aggravated'] = Math.max(0, updateData['system.health.aggravated'] - Math.abs(Math.abs(diff) - system.health.lethal));
      }

      let diffBashing = Math.max(0, Math.abs(diff) - system.health.value);
      if (system.health.lethal < Math.abs(diff)) diffBashing -= Math.abs(Math.abs(diff) - system.health.lethal);
      if (diffBashing > 0) { // Too much bashing damage, upgrade bashing to lethal, or lethal to aggravated damage.
        updateData['system.health.lethal'] -= diffBashing;
        if (updateData['system.health.lethal'] < 0) {
          updateData['system.health.aggravated'] = Math.max(0, updateData['system.health.aggravated'] + updateData['system.health.lethal']);
          updateData['system.health.lethal'] = 0;
        }
      }
    }
    this.update(updateData);
  }

  /**
   * Calculates and sets the maximum splat-specific resource for the actor.
   * Mage: Mana (determined by Gnosis)
   * Vampire: Vitae (determined by Blood Potency)
   */
  calculateAndSetMaxResource() {
    const system = this.system;
    if (system.characterType === "Mage" || system.characterType === "Proximi" || system.characterType === "Scelesti") { // Mana
      let maxResource = (system.characterType === "Mage" || system.characterType === "Scelesti") ? CONFIG.MTA.gnosis_levels[Math.min(9, Math.max(0, system.mage_traits.gnosis.final - 1))].max_mana : 5;
      let updateData = {}
      updateData['system.mana.max'] = maxResource;
      this.update(updateData);
    } else if (system.characterType === "Vampire") { // Vitae
      let maxResource = CONFIG.MTA.bloodPotency_levels[Math.min(10, Math.max(0, system.vampire_traits.bloodPotency.final))].max_vitae;
      if (system.vampire_traits.bloodPotency.final < 1) maxResource = system.attributes_physical.stamina.final
      
      let obj = {}
      obj['system.vitae.max'] = maxResource;
      this.update(obj);
    } else if (system.characterType === "Werewolf") { // Vitae
      let maxResource = CONFIG.MTA.primalUrge_levels[Math.min(9, Math.max(0, system.werewolf_traits.primalUrge.final - 1))].max_essence;
      
      let obj = {}
      obj['system.essence.max'] = maxResource;
      this.update(obj);
    } else if (system.characterType === "Demon") { // Vitae
      let maxResource = CONFIG.MTA.primum_levels[Math.min(9, Math.max(0, system.demon_traits.primum.final - 1))].max_aether;
      
      let obj = {}
      obj['system.aether.max'] = maxResource;
      this.update(obj);
    } else if (system.characterType === "Princess") {
      let maxResource = CONFIG.MTA.inner_light_levels[Math.min(9, Math.max(0, system.princess_traits.innerLight.final - 1))].max_wisps;
      
      let obj = {}
      obj['system.wisps.max'] = maxResource;
      this.update(obj);
    }

  }

  /**
   * Calculates and sets the maximum clarity for the actor using the formula
   * Wits + Composure.
   * If clarity is set lower than any damage, the damage is lost.
   * Also calls updateChangelingTouchstones().
   */
  async calculateAndSetMaxClarity() {
    const system = this.system;
    const maxClarity_old = system.clarity.max;
    let maxClarity = system.attributes_mental.wits.final + system.attributes_social.composure.final;

    let updateData = {}
    updateData['system.clarity.max'] = maxClarity;

    let diff = maxClarity - maxClarity_old;
    if (diff > 0) {
      updateData['system.clarity.severe'] = "" + (+system.clarity.severe + diff);
      updateData['system.clarity.value'] = "" + (+system.clarity.value + diff);
    } else {
      updateData['system.clarity.severe'] = "" + Math.max(0, (+system.clarity.severe + diff));
      updateData['system.clarity.value'] = "" + Math.max(0, (+system.clarity.value + diff));
    }
    await this.update(updateData);
    this.updateChangelingTouchstones();
  }

  /**
   * Updates the number of touchstones based on the maximum clarity.
   */
  updateChangelingTouchstones() {
    const system = this.system;
    let touchstones = duplicate(system.touchstones_changeling);
    let touchstone_amount = Object.keys(touchstones).length;
    if (touchstone_amount < system.clarity.max) {
      while (touchstone_amount < system.clarity.max) {
        touchstones[touchstone_amount + 1] = "";
        touchstone_amount = Object.keys(touchstones).length;
      }
    } else if (touchstone_amount > system.clarity.max) {
      while (touchstone_amount > system.clarity.max) {
        touchstones['-=' + touchstone_amount] = null;
        touchstone_amount -= 1;
      }
    }
    let updateData = {};
    updateData['system.touchstones_changeling'] = touchstones;
    this.update(updateData);
  }
}
