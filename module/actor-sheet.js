import {
  DiceRollerDialogue
} from "./dialogue-diceRoller.js";
import {
  ReloadDialogue
} from "./dialogue-reload.js";
import {
  createShortActionMessage
} from "./chat.js";
import {
  SkillEditDialogue
} from "./dialogue-skillEdit.js";
import {
  ProgressDialogue
} from "./dialogue-progress.js";
import "../lib/dragster/dragster.js";
import * as customui from "./ui.js";
import * as templates from "./templates.js";
import { TacticDialogue } from "./dialogue-tactic.js";

const getInventory = () => ({
  firearm: {
    dataset: ["MTA.DamageShort", "MTA.Range", "MTA.Cartridge", "MTA.Magazine", "MTA.InitiativeShort", "MTA.Size"]
  },
  melee: {
    dataset: ["MTA.Damage", "MTA.Type", "MTA.Initiative", "MTA.Size"]
  },
  armor: {
    dataset: ["MTA.Rating", "MTA.Defense", "MTA.Speed", "MTA.Coverage"]
  },
  equipment: {
    dataset: ["MTA.DiceBonus", "MTA.Durability", "MTA.Structure", "MTA.Size"]
  },
  ammo: {
    dataset: ["MTA.Cartridge", "MTA.Quantity"]
  },
  spell: {
    dataset: ["MTA.Arcanum", "MTA.Level", "MTA.PrimaryFactorShort", "MTA.Withstand", "MTA.RoteSkill"]
  },
  activeSpell: {
    dataset: ["MTA.Arcanum", "MTA.Level", "MTA.Potency", "MTA.Duration", "MTA.Scale"]
  },
  merit: {
    dataset: ["MTA.Rating"]
  },
  dreadPower: {
    dataset: ["MTA.Rating"]
  },
  numen: {
    dataset: ["MTA.Reaching"]
  },
  manifestation: {
    dataset: []
  },
  influence: {
    dataset: ["MTA.Rating"]
  },
  condition: {
    dataset: ["MTA.Persistent"]
  },
  tilt: {
    dataset: ["MTA.Environmental"]
  },
  yantra: {
    dataset: ["MTA.DiceBonus", "MTA.Type"]
  },
  attainment: {
    dataset: ["MTA.Arcanum", "MTA.Level", "MTA.Legacy"]
  },
  relationship: {
    dataset: ["MTA.Impression", "MTA.Doors", "MTA.Penalty"]
  },
  vehicle: {
    dataset: ["MTA.DiceBonus", "MTA.Size", "MTA.Durability", "MTA.Structure", "MTA.Speed"]
  },
  devotion: {
    dataset: ["MTA.Cost", "MTA.Action"]
  },
  rite: {
    dataset: ["MTA.Type", "MTA.RiteTarget", "MTA.Withstand"]
  },
  vinculum: {
    dataset: ["MTA.VinculumStage"]
  },
  discipline_power: {
    dataset: ["MTA.Discipline", "MTA.Level", "MTA.Cost", "MTA.Action"]
  },
  container: {
    dataset: ["MTA.Durability", "MTA.Structure", "MTA.Size"]
  },
  service: {
    dataset: ["MTA.DiceBonus", "MTA.Skill"]
  },
  contract: {
    dataset: ["MTA.Type", "MTA.Cost", "MTA.Action", "MTA.Duration"]
  },
  pledge: {
    dataset: ["MTA.Type"]
  },
  form: {
    descriptions: [],
    dataset: []
  },
  facet: {
    dataset: ["MTA.Gift", "MTA.Level", "MTA.Cost", "MTA.Action"]
  },
  werewolf_rite: {
    dataset: ["MTA.Type", "MTA.Level", "MTA.Action"]
  },
  embed: {
    dataset: ["MTA.Category", "MTA.Action", "MTA.Key"]
  },
  interlock: {
    dataset: ["MTA.Action", "MTA.Cost", "MTA.Key"]
  },
  exploit: {
    dataset: ["MTA.Action", "MTA.Cost"]
  },
  cover: {
    dataset: ["MTA.Rating", "MTA.Beats", "MTA.Active"]
  },
  glitch: {
    dataset: ["MTA.Category", "MTA.Class", "MTA.Variation"]
  },
  pact: {
    dataset: ["MTA.DemonAspectPoints", "MTA.HumanAspectPoints", "MTA.Duration"]
  },
  formAbility: {
    dataset: ["MTA.Weapon", "MTA.Active"]
  },
  coil: {
    dataset: ["MTA.Rating", "MTA.Mystery"]
  },
  scale: {
    dataset: ["MTA.Mystery"]
  },
  tactic: {
    dataset: ["MTA.Favored"]
  },
  advanced_armory: {
    dataset: ["MTA.Loadout", "MTA.Action", "MTA.Duration"]
  },
  virtuous_ritual: {
    dataset: ["MTA.TargetSuccesses", "MTA.Duration"]
  },
  castigation_rite: {
    dataset: ["MTA.Cost", "MTA.Action", "MTA.Duration"]
  },
  elixir: {
    dataset: ["MTA.Prepared", "MTA.Cost", "MTA.Action", "MTA.Duration"]
  },
  perispiritism_ritual: {
    dataset: ["MTA.Cost", "MTA.Action", "MTA.Duration"]
  },
  teleinformatics: {
    dataset: ["MTA.Cost", "MTA.Action", "MTA.Duration"]
  },
  thaumatech_implant: {
    dataset: ["MTA.Cost", "MTA.Action", "MTA.Duration"]
  },
  charm: {
    dataset: ["MTA.CharmType","MTA.Level", "MTA.Cost", "MTA.Action"]
  },
});

export class MtAActorSheet extends ActorSheet {
  constructor(...args) {
    super(...args);

    Hooks.on("closeProgressDialogue", (app, ele) => {
      if (app === this._progressDialogue) this._progressDialogue = null;
    });
  }

  /* -------------------------------------------- */

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    if (!game.user.isGM && this.actor.limited) return "systems/mta/templates/actors/limited-sheet.html";
    if (this.actor.type === "ephemeral") return "systems/mta/templates/actors/ephemeral-sheet.html";
    return "systems/mta/templates/actors/character.html";
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["mta-sheet", "worldbuilding", "sheet", "actor"],
      width: 1166,
      height: 830,
      dragDrop: [{ dragSelector: "tbody .item-row", dropSelector: null }],
      tabs: [{
        navSelector: ".tabs",
        contentSelector: ".sheet-body",
        initial: "attributes"
      }]
    });
  }

  /* -------------------------------------------- */

  /**
   * Prepare data for rendering the Actor sheet
   * The prepared data object contains both the actor data as well as additional sheet options
   */
  getData() {
    // The Actor's data
    const actor = this.actor;
    const systemData = actor.system;
    const items = actor.items;
    const sheetData = {};

    /* const data = super.getData();
    Object.assign(data.data, data.data.data)
    data.data.data = null; */ // Previous fix

    const inventory = getInventory();

    if (systemData.characterType === "Changeling") inventory.condition.dataset.push("MTA.Clarity");

    //Localise inventory headers
    Object.values(inventory).forEach(section => {
      section.items = [];
      section.dataset.forEach((item, i, a) => a[i] = game.i18n.localize(item));
    });

    items.forEach(item => {
      if (inventory[item.type]) {
        if (!inventory[item.type].items) {
          inventory[item.type].items = [];
        }
        inventory[item.type].items.push(item);
      }
    });

    //Inventory sorting
    const sortFlags = game.user.flags?.mta ? game.user.flags.mta[this.actor.id] : undefined;
    if (sortFlags) {
      for (let itemType in inventory) {
        const flag = sortFlags[itemType];
        if (flag && flag.sort === "up") {
          inventory[itemType].items.sort((a, b) => a.name.localeCompare(b.name))
        }
        else if (flag && flag.sort === "down") {
          inventory[itemType].items.sort((a, b) => b.name.localeCompare(a.name))
        }
        else {
          inventory[itemType].items.sort((a, b) => b.sort - a.sort);
        }
      }
    }
    else {
      for (let itemType in inventory) {
        inventory[itemType].items.sort((a, b) => b.sort - a.sort);
      }
    }

    if (systemData.characterType === "Werewolf") {
      inventory.form.items.forEach(async form => {
        const item = items.get(form._id);
        const chatData = await item.getChatData({
          secrets: actor.isOwner
        });
        inventory.form.descriptions.push(chatData.description);
      });
      // Example of a validation and correction step for Werewolf
      if (Array.isArray(systemData.werewolf_traits.primalUrge.final)) {
        console.warn("primalUrge.final is an array, expected a numeric value. Using the first non-null element.");
        systemData.werewolf_traits.primalUrge.final = systemData.werewolf_traits.primalUrge.final.find(value => value !== null) || 0; // Default to 0 if not found
      }
      systemData.essence_per_turn = CONFIG.MTA.primalUrge_levels[Math.min(9, Math.max(0, systemData.werewolf_traits.primalUrge.final - 1))].essence_per_turn;
    }

    if (systemData.characterType === "Princess") {
      inventory.form.items.forEach(async form => {
        const item = items.get(form._id);
        const chatData = await item.getChatData({
          secrets: actor.isOwner
        });
        inventory.form.descriptions.push(chatData.description);
      });
      console.debug(systemData.princess_traits.innerLight)
      
      if (Array.isArray(systemData.princess_traits.innerLight.final)) {
        console.warn("innerLight.final is an array, expected a numeric value. Using the first non-null element.");
        systemData.princess_traits.innerLight.final = systemData.princess_traits.innerLight.final.find(value => value !== null) || 0; // Default to 0 if not found
      }
      systemData.wisps_per_turn = CONFIG.MTA.inner_light_levels[Math.min(9, Math.max(0, systemData.princess_traits.innerLight.final - 1))].wisps_per_turn;
    }


    if (systemData.characterType === "Demon") {
      sheetData.embed = {};
      sheetData.interlock = {};
      const keys_embeds = inventory.embed.items.filter(item => item.system.isKey);
      for (let i = 1; i <= 4; i++) {
        const key_embed = keys_embeds.find(item => item.system.keyNumber === i);
        const key_interlock = inventory.interlock.items.find(item => item.system.keyNumber === i);
        if (key_embed) sheetData.embed[i] = key_embed;
        if (key_interlock) sheetData.interlock[i] = key_interlock;
      }

      sheetData.seesCipher = systemData.cipherVisible || game.user.isGM;
      sheetData.seesFinalTruth = systemData.finalTruthVisible || game.user.isGM;
      sheetData.isGM = game.user.isGM;

      sheetData.aether_per_turn = CONFIG.MTA.primum_levels[Math.min(9, Math.max(0, systemData.demon_traits.primum.final - 1))].aether_per_turn;
      sheetData.currentCover = 0;
      for (let item of items) {
        if (item.type === "cover" && item.system.isActive) {
          sheetData.currentCover = item.system.rating;
          sheetData.currentCoverName = item.name;
          break;
        }
      }
    }

    const isAnyMage = systemData.characterType === "Mage" || systemData.characterType === "Scelesti";

    if (isAnyMage) sheetData.mana_per_turn = CONFIG.MTA.gnosis_levels[Math.min(9, Math.max(0, systemData.mage_traits.gnosis.final - 1))].mana_per_turn;
    else if (systemData.characterType === "Proximi") sheetData.mana_per_turn = 1;
    if (systemData.characterType === "Vampire") sheetData.vitae_per_turn = CONFIG.MTA.bloodPotency_levels[Math.min(10, Math.max(0, systemData.vampire_traits.bloodPotency.final))].vitae_per_turn;
    if (systemData.characterType === "Changeling") sheetData.glamour_per_turn = CONFIG.MTA.glamour_levels[Math.min(9, Math.max(0, systemData.changeling_traits.wyrd.value - 1))].glamour_per_turn;
    if (actor.type !== "ephemeral") {
      systemData.progress ||= [];

      let beats = systemData.progress.reduce((acc, cur) => {
        if (cur && cur.beats) return acc + +cur.beats;
        else return acc;
      }, 0);

      if (systemData.beats) {
        beats += systemData.beats;
      }
      if (systemData.experience) {
        beats += 5 * systemData.experience;
      }

      sheetData.beats_computed = beats % 5;
      sheetData.experience_computed = Math.floor(beats / 5);
    }

    if (systemData.characterType === "Mage" || systemData.characterType === "Scelesti" || systemData.characterType === "Hunter") {

      let arcaneBeats = systemData.progress.reduce((acc, cur) => {
        if (cur && cur.arcaneBeats) return acc + 1 * cur.arcaneBeats;
        else return acc;
      }, 0);
      if (systemData.arcaneBeats) {
        arcaneBeats += systemData.arcaneBeats;
      }
      if (systemData.arcaneExperience) {
        arcaneBeats += 5 * systemData.arcaneExperience;
      }


      sheetData.arcaneBeats_computed = arcaneBeats % 5;
      sheetData.arcaneExperience_computed = Math.floor(arcaneBeats / 5);
    }

    if (actor.characterType === "Proximi" || isAnyMage) {
      sheetData.activeSpells = {
        value: inventory.activeSpell.items.reduce((acc, cur) => cur.system.isRelinquishedSafely ? acc + 0 : cur.system.isRelinquished ? acc + 0 : acc + 1, 0),
        max: isAnyMage ? systemData.mage_traits.gnosis.final : 1
      };
    }

    if (systemData.characterType === "Proximi") {
      sheetData.blessingLimit = {
        value: inventory.spell.items.reduce((acc, cur) => {
          return acc + cur.system.level;
        }, 0),
        max: 30
      };
    }

    if (systemData.characterType === "Hunter") {
      sheetData.thaumatech_count = inventory.thaumatech_implant.items.length;
      sheetData.thaumatech_max = systemData.attributes_physical.stamina.final + systemData.derivedTraits.size.final;
      sheetData.elixir_count = inventory.elixir.items.reduce((acc, elixir) => acc + elixir.system.prepared, 0) || 0;
      sheetData.elixir_max = systemData.attributes_physical.stamina.final + systemData.hunter_traits.elixir.value; //FIXME: value instead of final?
      sheetData.benediction_effective = systemData.hunter_traits.benediction.value + Math.min(0, systemData.integrity - 5);
    }

    if (actor.type === "ephemeral") {
      if (systemData.rank > 10) sheetData.ephemeralEntityName = "Uber-Entity"
      else if (systemData.rank < 1) sheetData.ephemeralEntityName = "Lesser Entity"
      else sheetData.ephemeralEntityName = CONFIG.MTA.ephemeral_ranks[systemData.rank - 1][systemData.ephemeralType];
    }

    //Get additional attributes & skills from config file
    if (actor.type === "character") {
      Object.entries(CONFIG.MTA.attributes_physical).forEach(([key, value], index) => {
        if (!systemData.attributes_physical[key]) systemData.attributes_physical[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.attributes_social).forEach(([key, value], index) => {
        if (!systemData.attributes_social[key]) systemData.attributes_social[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.attributes_mental).forEach(([key, value], index) => {
        if (!systemData.attributes_mental[key]) systemData.attributes_mental[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.skills_physical).forEach(([key, value], index) => {
        if (!systemData.skills_physical[key]) systemData.skills_physical[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.skills_social).forEach(([key, value], index) => {
        if (!systemData.skills_social[key]) systemData.skills_social[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.skills_mental).forEach(([key, value], index) => {
        if (!systemData.skills_mental[key]) systemData.skills_mental[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.arcana_gross).forEach(([key, value], index) => {
        if (!systemData.arcana_gross[key]) systemData.arcana_gross[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.arcana_subtle).forEach(([key, value], index) => {
        if (!systemData.arcana_subtle[key]) systemData.arcana_subtle[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.disciplines_common).forEach(([key, value], index) => {
        if (!systemData.disciplines_common[key]) systemData.disciplines_common[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.disciplines_unique).forEach(([key, value], index) => {
        if (!systemData.disciplines_unique[key]) systemData.disciplines_unique[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.werewolf_renown).forEach(([key, value], index) => {
        if (!systemData.werewolf_renown[key]) systemData.werewolf_renown[key] = { value: 0 };
      });
    }
    else if (actor.type === "ephemeral") {
      Object.entries(CONFIG.MTA.eph_physical).forEach(([key, value], index) => {
        if (!systemData.eph_physical[key]) systemData.eph_physical[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.eph_social).forEach(([key, value], index) => {
        if (!systemData.eph_social[key]) systemData.eph_social[key] = { value: 0 };
      });
      Object.entries(CONFIG.MTA.eph_mental).forEach(([key, value], index) => {
        if (!systemData.eph_mental[key]) systemData.eph_mental[key] = { value: 0 };
      });
    }

    const data = {
      actor,
      inventory,
      system: systemData,
      owner: actor.isOwner,
      limited: actor.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: actor.isOwner ? "editable" : "locked",
      config: CONFIG.MTA,
      rollData: this.actor.getRollData.bind(this.actor), // What is this?
      ...sheetData
    };
    console.log(data)
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    //Custom select text boxes
    customui.registerCustomSelectBoxes(html, this);

    //Health tracker
    /* this._onBoxChange(html); */
    this._initialiseDotTrackers(html);

    // 
    html.find('.cell.item-name span').click(event => this._onItemSummary(event));

    // Collapse item table
    html.find('.item-table .cell.header.first .collapsible.button').click(event => this._onTableCollapse(event));

    // Receive collapsed state from flags
    html.find('.item-table .cell.header.first .collapsible.button').toArray().filter(ele => {
      if (this.actor && this.actor.id && game.user.flags.mta && game.user.flags.mta[this.actor.id] && game.user.flags.mta[this.actor.id][$(ele).siblings('.sortable.button')[0].dataset.type] && game.user.flags.mta[this.actor.id][$(ele).siblings('.sortable.button')[0].dataset.type].collapsed) {
        $(ele).parent().parent().parent().siblings('tbody').hide();
        $(ele).addClass("fa-plus-square");
      }
    });

    // Sort item table
    html.find('.item-table .cell.header.first .sortable.button').click(event => this._onTableSort(event));

    // Receive sort state from flags
    html.find('.item-table .cell.header.first .sortable.button').toArray().filter(ele => {
      if (this.actor && this.actor.id && game.user.flags.mta && game.user.flags.mta[this.actor._id] && game.user.flags.mta[this.actor.id][ele.dataset.type]) {
        const sort = game.user.flags.mta[this.actor.id][ele.dataset.type].sort;
        const et = $(ele).children(".fas");
        if (sort === "up") { // sort A-Z
          et.removeClass("fa-sort");
          et.addClass("fa-sort-up");

        }
        else if (sort === "down") { // sort Z-A
          et.removeClass("fa-sort");
          et.removeClass("fa-sort-up");
          et.addClass("fa-sort-down");

        }
      }
    });

    /* Everything below here is only needed if the sheet is editable */
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-edit').click(event => {
      const itemId = event.currentTarget.closest(".item-edit").dataset.itemId;
      const item = this.actor.items.get(itemId);
      item.sheet.render(true);
    });

    html.find('.item-delete').click(ev => {
      const itemId = event.currentTarget.closest(".item-delete").dataset.itemId;

      if (ev.shiftKey) { // Delete immediately
        this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        return;
      }

      // Confirmation dialogue
      let d = new Dialog({
        title: "Confirm delete",
        content: "<p>Are you sure you want to permanently delete this item?</p><p>(Holding shift skips this dialogue)</p>",
        buttons: {
          one: {
            icon: '<i class="fas fa-trash"></i>',
            label: "Delete",
            callback: () => this.actor.deleteEmbeddedDocuments("Item", [itemId])
          },
          two: {
            label: "Cancel"
          }
        },
        default: "two"
      });
      d.render(true);
    });

    // Item Dragging

    let handler = ev => this._handleDragEnter(ev)
    html.find('.item-row').each((i, li) => {
      if (li.classList.contains("header")) return;
      //li.setAttribute("draggable", true);
      new Dragster(li);
      li.addEventListener("dragster:enter", ev => this._handleDragEnter(ev), false);
      li.addEventListener("dragster:leave", ev => this._handleDragLeave(ev), false);
    });

    // Equip Inventory Item
    html.find('.equipped.checkBox input').click(ev => {
      const itemId = ev.currentTarget.closest(".equipped.checkBox input").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.equipped;
      const updateData = {
        "system.equipped": toggle
      };
      item.update(updateData);
    });

    html.find('.coverActive.checkBox input').click(ev => {
      const itemId = ev.currentTarget.closest(".coverActive.checkBox input").dataset.itemId;
      const item = this.actor.items.get(itemId);
      const updateData = [];
      this.actor.items.forEach(actorItem => {
        if (actorItem._id !== item._id && actorItem.type == "cover" && actorItem.system.isActive) {
          updateData.push({
            _id: actorItem._id,
            "system.isActive": false
          });
        }
      });
      updateData.push({
        _id: item._id,
        "system.isActive": !item.system.isActive
      });
      this.actor.updateEmbeddedDocuments("Item", updateData);
    });

    html.find('.formAbilityActive.checkBox input').click(ev => {
      const itemId = ev.currentTarget.closest(".formAbilityActive.checkBox input").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.effectsActive;
      const updateData = {
        "system.effectsActive": toggle
      };
      item.update(updateData);
    });

    html.find('.spell-rote').click(ev => {
      const itemId = ev.currentTarget.closest(".spell-rote").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.isRote
      const updateData = {
        "system.isRote": toggle
      };
      item.update(updateData);
    });

    html.find('.spell-praxis').click(ev => {
      const itemId = ev.currentTarget.closest(".spell-praxis").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.isPraxis
      const updateData = {
        "system.isPraxis": toggle
      };
      item.update(updateData);
    });

    html.find('.spell-inured').click(ev => {
      const itemId = ev.currentTarget.closest(".spell-inured").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.isInured
      const updateData = {
        "system.isInured": toggle
      };
      item.update(updateData);
    });

    html.find('.spell-befouled').click(ev => {
      const itemId = ev.currentTarget.closest(".spell-befouled").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.isBefouled
      const updateData = {
        "system.isBefouled": toggle
      };
      item.update(updateData);
    });

    html.find('.favicon').click(ev => {
      const itemId = ev.currentTarget.closest(".favicon").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.isFavorite
      const updateData = {
        "system.isFavorite": toggle
      };
      item.update(updateData);
    });

    html.find('.activeIcon').click(ev => {
      const itemId = ev.currentTarget.closest(".activeIcon").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let toggle = !item.system.effectsActive
      const updateData = {
        "system.effectsActive": toggle
      };
      item.update(updateData);
    });

    html.find('.relinquish.unsafe').click(ev => {
      const itemId = ev.currentTarget.closest(".relinquish.unsafe").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let isRelinquished = !item.system.isRelinquished;
      let isRelinquishedSafely = false;
      const updateData = {
        "system.isRelinquished": isRelinquished,
        "system.isRelinquishedSafely": isRelinquishedSafely
      };
      item.update(updateData);
    });

    html.find('.relinquish.safe').click(ev => {
      const itemId = ev.currentTarget.closest(".relinquish.safe").dataset.itemId;
      const item = this.actor.items.get(itemId);
      let isRelinquishedSafely = !item.system.isRelinquishedSafely;
      let isRelinquished = false;
      const updateData = {
        "system.isRelinquished": isRelinquished,
        "system.isRelinquishedSafely": isRelinquishedSafely
      };
      item.update(updateData);
    });

    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.discipline-create').click(ev => {
      let ownDisciplines = this.actor.system.disciplines_own ? duplicate(this.actor.system.disciplines_own) : {};
      let discipline = {
        label: "New Discipline",
        value: 0
      };
      let newKey = Object.keys(ownDisciplines).reduce((acc, ele) => {
        return +ele > acc ? +ele : acc;
      }, 0);
      newKey += 1;
      ownDisciplines[newKey] = discipline;
      const updateData = {
        "system.disciplines_own": ownDisciplines
      };
      this.actor.update(updateData);
    });

    html.find('.invocation-create').click(ev => {
      console.debug("Creating new invocation");
      let ownInvocations = this.actor.system.invocation_own ? duplicate(this.actor.system.invocation_own) : {};
      console.debug(ownInvocations);
      let invocation = {
        label: "New Invocation",
        value: 0
      };
      let newKey = Object.keys(ownInvocations).reduce((acc, ele) => {
        return +ele > acc ? +ele : acc;
      }, 0);
      newKey += 1;
      ownInvocations[newKey] = invocation;
      const updateData = {
        "system.invocation_own": ownInvocations
      };
      console.debug(updateData);
      this.actor.update(updateData);
    });

    html.find('.discipline-delete').click(ev => {
      let ownDisciplines = this.actor.system.disciplines_own ? duplicate(this.actor.system.disciplines_own) : {};
      const discipline_key = ev.currentTarget.closest(".discipline-delete").dataset.attribute;

      //delete ownDisciplines[discipline_key];
      ownDisciplines['-=' + discipline_key] = null;
      let updateData = {
        "system.disciplines_own": ownDisciplines
      };
      this.actor.update(updateData);
    });

    html.find('.invocation-delete').click(ev => {
      let ownInvocations = this.actor.system.invocation_own ? duplicate(this.actor.system.invocation_own) : {};
      const invocation_key = ev.currentTarget.closest(".invocation-delete").dataset.attribute;

      //delete ownDisciplines[discipline_key];
      ownInvocations['-=' + invocation_key] = null;
      let updateData = {
        "system.invocation_own": ownInvocations
      };
      this.actor.update(updateData);
    });

    html.find('.discipline-edit').click(ev => {
      const et = $(ev.currentTarget);
      et.siblings(".discipline-name").toggle();
      et.siblings(".attribute-button").toggle();
    });

    $('.discipline-edit').on('keypress', function (e) {
      if (e.which === 13) {
        const et = $(ev.currentTarget);
        et.siblings(".discipline-name").toggle();
        et.siblings(".attribute-button").toggle();
      }
    });

    html.find('.invocation-edit').click(ev => {
      console.debug("Toggling name on")
      const et = $(ev.currentTarget);
      et.siblings(".invocation-name").toggle();
      et.siblings(".attribute-button").toggle();
    });

    $('.invocation-edit').on('keypress', function (e) {
      if (e.which === 13) {
        const et = $(ev.currentTarget);
        et.siblings(".invocation-name").toggle();
        et.siblings(".attribute-button").toggle();
      }
    });

    // Reload Firearm
    html.find('.item-reload').click(ev => this._onItemReload(ev));

    html.find('.progress').click(async ev => {
      if (this._progressDialogue) this._progressDialogue.bringToTop();
      else this._progressDialogue = await new ProgressDialogue(this.actor).render(true);
    });

    html.find('.item-magValue').mousedown(ev => this._onItemChangeAmmoAmount(ev));

    html.find('.skill-specialty').click(ev => {
      ev.preventDefault();
      const trait = ev.currentTarget.dataset.trait;
      new SkillEditDialogue(this.actor, trait).render(true);
    });

    html.find('.niceNumber').click(function (event) {
      let v = $(event.target).text();
      let i = $(this).find('input');

      if (v === '+') {
        i.val(parseInt(i.val()) + 1);
      } else if (v === '−') {
        i.val(parseInt(i.val()) - 1);
      }

      i.trigger('change');
    });


    html.find('.arcana-state').click(ev => {
      const traitName = ev.currentTarget.closest(".arcana-state").dataset.trait;

      const type = traitName.split('.')[0];
      const arcanum = traitName.split('.')[1];

      let updateAttribute = duplicate(this.actor.system[type]);

      if (updateAttribute[arcanum].isRuling) {
        updateAttribute[arcanum].isRuling = false;
        updateAttribute[arcanum].isInferior = true;

      } else if (updateAttribute[arcanum].isInferior) {
        updateAttribute[arcanum].isRuling = false;
        updateAttribute[arcanum].isInferior = false;
      } else {
        updateAttribute[arcanum].isRuling = true;
        updateAttribute[arcanum].isInferior = false;
      }

      let obj = {}
      obj[`system.${type}`] = updateAttribute;
      this.actor.update(obj);

    });

    html.find('.renown-state').click(ev => {
      const traitName = ev.currentTarget.closest(".renown-state").dataset.trait;

      const type = traitName.split('.')[0];
      const renown = traitName.split('.')[1];

      let updateAttribute = duplicate(this.actor.system.werewolf_renown);

      if (this.actor.system.werewolf_renown[renown].isAuspice) {
        updateAttribute[renown].isAuspice = false;
        updateAttribute[renown].isTribe = true;

      } else if (this.actor.system.werewolf_renown[renown].isTribe) {
        updateAttribute[renown].isAuspice = false;
        updateAttribute[renown].isTribe = false;
      } else {
        updateAttribute[renown].isAuspice = true;
        updateAttribute[renown].isTribe = false;
      }

      let obj = {}
      obj['system.werewolf_renown'] = updateAttribute;
      this.actor.update(obj);

    });

    // Item Rolling
    html.find('.item-table .item-image').click(event => this._onItemRoll(event));

    // Werewolf transform
    html.find('.forms-column .item-image').click(event => this._onWerewolfTransform(event));
    
    // Princess transform
    html.find('.forms-column .item-image').click(event => this._onPrincessTransform(event));

    // Calculate Max Health
    html.find('.calculate.health').click(event => {
      this.actor.calculateAndSetMaxHealth();
    });

    html.find('.calculate.resource').click(event => {
      this.actor.calculateAndSetMaxResource();
    });

    html.find('.calculate.clarity').click(event => {
      this.actor.calculateAndSetMaxClarity();
    });

    // Macros

    html.find('.perceptionButton').mousedown(ev => {
      switch (ev.which) {
        case 1:
          this.actor.rollPerception(false, true);
          break;
        case 2:
          break;
        case 3:
          //Quick Roll
          this.actor.rollPerception(true, true);
          break;
      }

    });

    html.find('.breakingPointButton').mousedown(ev => {
      switch (ev.which) {
        case 1:
          this.actor.rollBreakingPoint(false, false);
          break;
        case 2:
          break;
        case 3:
          //Quick Roll
          this.actor.rollBreakingPoint(true, false);
          break;
      }
    });

    html.find('.dissonanceButton').mousedown(ev => {
      switch (ev.which) {
        case 1:
          this.actor.rollDissonance(false, false);
          break;
        case 2:
          break;
        case 3:
          //Quick Roll
          this.actor.rollDissonance(true, false);
          break;
      }
    });

    html.find('.compromiseButton').mousedown(ev => {
      switch (ev.which) {
        case 1:
          this.actor.rollCompromise(false, false);
          break;
        case 2:
          break;
        case 3:
          //Quick Roll
          this.actor.rollCompromise(true, false);
          break;
      }
    });

    html.find('.dreamingButton').mousedown(ev => {
      switch (ev.which) {
        case 1:
          this.actor.dreaming();
          break;
        case 2:
          break;
        case 3:
          // Unequip items
          this.actor.dreaming(true);
          break;
      }

    });

    html.find('.amnionButton').mousedown(ev => {
      this.actor.callAmnion();
    });

    // Clicking roll button
    html.find('.rollButton').mousedown(ev => {

      const attributeChecks = $(".attribute-check:checked");

      const attributeInputs = [];
      attributeChecks.each(function () {
        let $this = $(this);

        if ($this.attr("data-trait")) {
          attributeInputs.push($this);
        } else if ($this.parent().attr("data-trait")) {
          attributeInputs.push($this.parent());
        }
      });

      const rollAttributes = attributeInputs.map(v => v.attr("data-trait"));

      switch (ev.which) {
        case 1:
          this.actor.roll({ traits: rollAttributes })
          break;
        case 2:
          break;
        case 3:
          //Quick Roll
          this.actor.roll({ traits: rollAttributes, rollType: 'quick' })
          break;
      }

      //Uncheck attributes/skills and reset
      attributeChecks.prop("checked", !attributeChecks.prop("checked"));
    });

    //Clicking spellcasting button
    html.find('.improvisedSpellButton').mousedown(ev => this._onActivateSpell(ev));
  }

  /* Handles drag-and-drop visual */
  _handleDragEnter(event) {
    let ele = event.target.closest(".item-row");
    if (ele) $(ele).addClass('over')
  }

  _handleDragLeave(event) {
    let ele = event.target.closest(".item-row");
    if (ele) $(ele).removeClass('over')
  }


  _onDragStart(event) {
    const id = event.target.dataset.itemId;
    const source = this.actor.items.get(id);
    const background = source.img;
    let img = $(event.target).find('.item-image');
    img.css("cssText", 'background-image: url(' + background + ') !important');

    event.dataTransfer.setDragImage(img[0], 0, 0);
    return super._onDragStart(event);
  }
  /** @override 
  * Exact copy of the foundry code, except for the !target render,
  * and the sortBefore check.
  */
  _onSortItem(event, itemData) {
    // TODO - for now, don't allow sorting for Token Actor overrides
    //if (this.actor.isToken) return;

    // Get the drag source and its siblings
    const source = this.actor.items.get(itemData._id);
    if (!source) return;
    const siblings = this.actor.items.filter(i => {
      return (i.type === source.type) && (i._id !== source._id);
    });

    if (siblings.length <= 0) return;

    // Get the drop target
    const dropTarget = event.target.closest(".item");
    const targetId = dropTarget ? dropTarget.dataset.itemId : null;

    //Find target that matches the source type and is not the source itself
    const target = this.actor.items.find(i => {
      return (i.type === source.type)
        && (i._id !== source._id)
        && (i._id === targetId);
    });

    if (!target) return this.render();

    const sortBefore = source.sort > target?.sort;

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(source, { target: target, siblings: siblings, sortBefore: sortBefore });
    const updateData = sortUpdates.map(u => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });
    // Perform the update
    return this.actor.updateEmbeddedDocuments("Item", updateData);

  }

  async _onActivateSpell(ev, spell) {
    this.actor.castSpell(spell);
  }

  async _onRollTactic(ev, item) {
    let tacticDialogue = new TacticDialogue(this.actor, item);
    tacticDialogue.render(true);
  }




  /** @override */
  async _onDropItemCreate(itemData) {
    let items = itemData instanceof Array ? itemData : [itemData];

    const toCreate = [];
    for (const item of items) {
      const result = await this._onDropSingleItem(item);
      if (result) toCreate.push(result);
    }

    // Create the owned items as normal
    return this.actor.createEmbeddedDocuments("Item", toCreate);
  }

  /**
     * Handles dropping of a single item onto this character sheet.
     * @param {object} itemData            The item data to create.
     * @returns {Promise<object|boolean>}  The item data to create after processing, or false if the item should not be
     *                                     created or creation has been otherwise handled.
     * @protected
     */
  async _onDropSingleItem(itemData) {

    // Check to make sure items of this type are allowed on this actor
    if (this.actor.type !== "ephemeral" && CONFIG.MTA.ephemeralItemTypes.includes(itemData.type)) {
      ui.notifications.warn("The item type can not be equipped by this character.");
      return false;
    }
    if (this.actor.type !== "character" && CONFIG.MTA.characterItemTypes.includes(itemData.type)) {
      ui.notifications.warn("The item type can not be equipped by this character.");
      return false;
    }

    // Clean up data
    if (itemData.system) {
      if (itemData.type === "spell") {
        itemData.system.isPraxis = false;
        itemData.system.isRote = false;
        itemData.system.isInured = false;
        itemData.system.isBefouled = false;
      }
      if (itemData.type === "cover") {
        itemData.system.isActive = false;
      }
      if (itemData.system.equipped) itemData.system.equipped = false;
      if (itemData.system.isFavorite) itemData.system.isFavorite = false;
    }

    return itemData;
  }

  async _onItemChangeAmmoAmount(ev) {
    const weaponId = ev.currentTarget.closest(".item-magValue").dataset.itemId;
    const weapon = this.actor.items.get(weaponId);
    const magazine = weapon.system.magazine;

    if (magazine) {
      let ammoCount = magazine.system.quantity;
      switch (ev.which) {
        case 1:
          ammoCount = Math.min(ammoCount + 1, weapon.system.capacity);
          break;
        case 2:
          break;
        case 3:
          ammoCount = Math.max(ammoCount - 1, 0);
          break;
      }

      weapon.update({
        'system.magazine.system.quantity': ammoCount
      });
    }
  }

  /**
   * Handle reloading of a firearm from the Actor Sheet
   * @private
   */
  async _onItemReload(ev) {

    const weaponId = ev.currentTarget.closest(".item-reload").dataset.itemId;
    const weapon = this.actor.items.get(weaponId);
    const weaponData = weapon.system;
    if (weaponData.magazine) { // Eject magazine
      createShortActionMessage("Ejects magazine", this.actor);

      ev.target.classList.remove("reloaded");

      //Add ejected ammo back into the inventory
      const ammoData = { ...weaponData.magazine };
      delete ammoData._id;
      delete ammoData.effects; // TODO: Remove once foundry bug is fixed (can't find the issue??)

      let foundElement = this.actor.items.find(item => (item.name === ammoData.name) && (item.system.cartridge === ammoData.system.cartridge));

      let updateData = [];
      let a;
      //const index = inventory.findIndex(ele => (ele.data.name === ammoData.name) && (ele.data.cartridge === ammoData.cartridge));
      if (foundElement) { // Add ammo to existing magazine
        updateData.push({
          _id: foundElement._id,
          'system.quantity': foundElement.system.quantity + ammoData.system.quantity
        });
      }
      else a = await this.actor.createEmbeddedDocuments("Item", [ammoData]); // Add new magazine item

      updateData.push({
        _id: weapon.id,
        'system.magazine': null
      }); // Remove magazine from weapon
      this.actor.updateEmbeddedDocuments("Item", updateData);

    } else {
      //Open reload menu
      let ammoList = new ReloadDialogue(weapon, ev.target);
      ammoList.render(true);
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const itemData = {
      name: `New ${type.capitalize()}`,
      type: type,
      data: duplicate(header.dataset)
    };

    delete itemData.data["type"];
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
  _onItemRoll(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item-name").dataset.itemId;
    const item = this.actor.items.get(itemId);

    // Roll spells through the actor
    if (item.type === "spell") return this._onActivateSpell(event, item);
    if (item.type === "tactic") return this._onRollTactic(event, item);
    // Otherwise roll the Item directly


    return item.roll();
  }

  /**
     * Handle transformation into a werewolf form.
     * @private
     */
  async _onWerewolfTransform(event) { //TODO: move this to actor.js
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    let updates = [];
    const forms = this.actor.items.filter(item => item.type === "form");

    forms.forEach(f => {
      updates.push({ _id: f._id, 'system.effectsActive': f._id === itemId ? true : false });
    });
    item.showChatCard()
    await this.actor.updateEmbeddedDocuments("Item", updates);
    this.actor.calculateAndSetMaxHealth();
  }

  /**
     * Handle transformation into a princess regallia.
     * @private
     */
  async _onPrincessTransform(event) { //TODO: move this to actor.js
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);
    let updates = [];
    const forms = this.actor.items.filter(item => item.type === "regalia");

    forms.forEach(f => {
      updates.push({ _id: f._id, 'system.effectsActive': f._id === itemId ? true : false });
    });
    item.showChatCard()
    await this.actor.updateEmbeddedDocuments("Item", updates);
    this.actor.calculateAndSetMaxHealth();
  }


  /**
   * Handle collapsing of inventory tables (e.g. firearms, etc.).
   * The collapsed state is stored per user for every actor for every table.
   * @private
   */
  _onTableCollapse(event) {
    const et = $(event.currentTarget);
    if (et.hasClass('fa-plus-square')) { // collapsed
      et.removeClass("fa-plus-square");
      et.addClass("fa-minus-square");
      et.parent().parent().parent().siblings('tbody').show();

      // Update user flags, so that collapsed state is saved
      let updateData = { 'flags': { 'mta': { [this.actor._id]: { [et.siblings('.sortable.button')[0].dataset.type]: { collapsed: false } } } } };
      game.user.update(updateData);

    } else { // not collapsed
      et.parent().parent().parent().siblings('tbody').hide();
      et.removeClass("fa-minus-square");
      et.addClass("fa-plus-square");

      // Update user flags, so that collapsed state is saved
      let updateData = { 'flags': { 'mta': { [this.actor._id]: { [et.siblings('.sortable.button')[0].dataset.type]: { collapsed: true } } } } };
      game.user.update(updateData);
    }
  }


  async _onTableSort(event) {
    const et = $(event.currentTarget).children(".fas");
    if (et.hasClass('fa-sort')) { // sort A-Z
      et.removeClass("fa-sort");
      et.addClass("fa-sort-up");

      // Update user flags, so that sorted state is saved
      let updateData = { 'flags': { 'mta': { [this.actor.id]: { [event.currentTarget.dataset.type]: { sort: 'up' } } } } };
      await game.user.update(updateData);
    }
    else if (et.hasClass('fa-sort-up')) { // sort Z-A
      et.removeClass("fa-sort-up");
      et.addClass("fa-sort-down");

      // Update user flags, so that sorted state is saved
      let updateData = { 'flags': { 'mta': { [this.actor.id]: { [event.currentTarget.dataset.type]: { sort: 'down' } } } } };
      await game.user.update(updateData);
    }
    else {
      et.removeClass("fa-sort-down"); // unsorted
      et.addClass("fa-sort");

      // Update user flags, so that sorted state is saved
      let updateData = { 'flags': { 'mta': { [this.actor.id]: { [event.currentTarget.dataset.type]: { sort: 'none' } } } } };
      await game.user.update(updateData);
    }
    this.render()
  }


  async _onItemSummary(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item-row");

    // Toggle summary
    if (li.hasClass("expanded")) {
      const summary = li.next(".item-summary");
      summary.children().children("div").slideUp(200, () => summary.remove());
    } else {
      const tb = $(event.currentTarget).parents(".item-table");
      const colSpanMax = [...tb.get(0).rows[0].cells].reduce((a, v) => (v.colSpan) ? a + v.colSpan * 1 : a + 1, 0);
      const item = this.actor.items.get(li.data("item-id"));
      const chatData = await item.getChatData({
        secrets: this.actor.owner
      });
      const tr = $(`<tr class="item-summary"> <td colspan="${colSpanMax}"> <div> ${chatData.description} </div> </td> </tr>`);
      const div = tr.children().children("div");
      div.hide();
      li.after(tr);
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }

  async _initialiseDotTrackers(html) {
    let trackers = html.find('.kMageTracker');
    trackers.toArray().forEach(trackerEle => {
      if (trackerEle.dataset && !trackerEle.dataset.initialised) {
        let makeHiddenInput = (name, value, dataType = "Number") => {
          let i = document.createElement('input');
          i.type = 'hidden';
          i.name = name;
          i.value = value;
          if (dataType) { i.dataset.dtype = dataType; }
          return trackerEle.insertAdjacentElement('afterbegin', i);
        }
        let td = trackerEle.dataset;
        let trackerName = td.name || 'unknowntracker';
        let trackerNameDelimiter = '.';
        let trackerType = (td.type) ? td.type : 'oneState';
        let stateOrder = (td.states) ? td.states.split('/') : ['off', 'on'];
        let stateCount = stateOrder.map(v => (td[v]) ? td[v] * 1 : 0).map((v, k, a) => ((k > 0) ? a[0] - v : v)).map(v => (v < 0) ? 0 : v);
        let stateHighest = stateOrder.length - 1;
        let markingOn = (td.marked !== undefined) ? true : false;
        let markedBoxes = null, mbInput = null;
        if (markingOn) {
          markedBoxes = [...Array(stateCount[0])].map(v => 0);
          td.marked.split(',').forEach((v, k) => { if (k < markedBoxes.length && (v * 1)) { markedBoxes[k] = 1 } })
          mbInput = makeHiddenInput(trackerName + trackerNameDelimiter + 'marked', markedBoxes.join(','), false);
          trackerEle.insertAdjacentElement('afterbegin', mbInput)
        }
        let renderBox = trackerEle.appendChild(document.createElement('div'));
        trackerEle.dataset.initialised = 'yes';
        let inputs = stateOrder.map((v, k) => {
          if (k === 0 && this.options.editable) {
            trackerEle.insertAdjacentHTML('afterbegin', `<div class="niceNumber">
             <input name="${trackerName + trackerNameDelimiter + v}" type="number" value="${stateCount[k]}">
             <div class="numBtns"><div class="plusBtn">+</div><div class="minusBtn">−</div></div>
            </div>`);
            return trackerEle.firstChild;
          } else {
            return makeHiddenInput(trackerName + trackerNameDelimiter + v, stateCount[0] - stateCount[k]);
          }
        });

        let updateDots = (num = 0, index = false) => {
          let abNum = Math.abs(num);

          // update the stateCount
          // if(index) then fill all dots up to & incl. index with num or empty all dots down to & incl. index if they are <=
          if (num > 0 || num < 0) {
            if (index !== false) {
              stateCount.forEach((c, s, a) => { if (s <= abNum && s > 0) { a[s] = (num > 0) ? index + 1 : index; } });
            } else {
              stateCount = stateCount.map((c, s, a) => (num > 0 && s == abNum) ? c + 1 : (num < 0 && s <= abNum && s > 0) ? c - 1 : c);
            }
          }

          // clamping down values in case they somehow got bugged minimum 0, maximum is the count of state 0
          stateCount = stateCount.map(v => (v < 0) ? 0 : (v > stateCount[0]) ? stateCount[0] : v);

          // removing marks if the corresponding box is set to status 0
          if (markingOn) {
            markedBoxes = markedBoxes.map((v, k) => (v && k < stateCount[1]) ? v : 0);
          }

          // update inputs
          stateCount.forEach((c, s) => {
            let nuVal = stateCount[0] - c;
            if (inputs[s].value !== undefined && inputs[s].value != nuVal) { inputs[s].value = nuVal; }
          });
          if (markingOn) {
            mbInput.value = markedBoxes.join(',');
          }


          // render
          let dots = [...Array(stateCount[0])].map((v, k) => stateCount.slice(1).reduce((a, scC, scK) => (scC >= (k + 1)) ? scK + 1 : a, 0));
          let r = '<div class="boxes">' + dots.reduce((a, v, k) => a + `<div data-state="${v}" data-index="${k}"${markingOn && markedBoxes[k] ? ' data-marked="true" title="Resistant"' : ''}></div>`, '') + '</div>';
          if (trackerType == 'health' && !(this.actor.type === "ephemeral")) {
            //let dicePenalty = dots.slice(-stateHighest).reduce( (a,v) => (v>0)?a+1:a ,0);
            let dicePenalty = this.actor.getWoundPenalties();
            let penaltyMap = {
              '0': game.i18n.localize('MTA.HealthPenalty.physicallyStable'),
              '1': game.i18n.localize('MTA.HealthPenalty.losingConsciousness'),
              '2': game.i18n.localize('MTA.HealthPenalty.bleedingOut'),
              '3': game.i18n.localize('MTA.HealthPenalty.dead')
            };
            r += `<div class="info"><span>${game.i18n.localize('MTA.HealthPenalty.YouAre')} <b>${penaltyMap[dots[dots.length - 1]]}</b>.</span><span>${game.i18n.localize('MTA.DicePenalty')}<b>−${dicePenalty}</b></span></div>`;
          }
          else if (trackerType == 'clarity') {
            //let dicePenalty = dots.slice(-stateHighest).reduce( (a,v) => (v>0)?a+1:a ,0);
            let diceBonus = this.actor.getClarityBonus();

            //const dmg = dots.filter(v => v === 0);
            //let dicePenalty = (dmg.length < 3) ? -2 : (dmg.length < 5) ? -1 : 0;
            //if(dmg.length === dots.length) dicePenalty += 2;
            if (diceBonus >= 0) diceBonus = '+' + diceBonus;
            if (diceBonus === -99) diceBonus = '?';
            let penaltyMap = {
              '+2': game.i18n.localize('MTA.ClarityPenalty.lucid'),
              '+1': game.i18n.localize('MTA.ClarityPenalty.rational'),
              '+0': game.i18n.localize('MTA.ClarityPenalty.clear-headed'),
              '-1': game.i18n.localize('MTA.ClarityPenalty.hazy'),
              '-2': game.i18n.localize('MTA.ClarityPenalty.losingTrack'),
              '?': game.i18n.localize('MTA.ClarityPenalty.inAComa')
            };

            r += `<div class="info"><span>${game.i18n.localize('MTA.HealthPenalty.YouAre')} <b>${penaltyMap[diceBonus]}</b>.</span><span>${game.i18n.localize('MTA.Perception')}:  <b>${diceBonus}</b></span></div>`;
          }
          renderBox.innerHTML = r;

          if (num !== 0) { inputs[1].dispatchEvent(new Event('change', { 'bubbles': true })) }
        };

        if (this.options.editable) {
          // attaching event listeners for left and right clicking the states and changing the max value input
          trackerEle.addEventListener('pointerdown', (e, t = e.target) => {
            if (t.dataset && t.dataset.state) {
              let s = t.dataset.state * 1;
              let index = (trackerType == 'oneState' && t.dataset.index) ? t.dataset.index * 1 : false;

              if (e.button === 1 && markingOn && t.dataset.index && t.dataset.index < markedBoxes.length) {
                e.preventDefault();
                markedBoxes[t.dataset.index] = (markedBoxes[t.dataset.index]) ? 0 : 1;
                updateDots('update');
              }
              else {
                updateDots((e.button === 2) ? -s : (s === stateHighest) ? -s : s + 1, index);
              }
            }
          });
          trackerEle.addEventListener('contextmenu', (e, t = e.target) => { if (t.dataset.state) { e.preventDefault(); } });
          trackerEle.addEventListener('input', (e, t = e.target) => {
            if (t.type == 'number' && t.name == (trackerName + trackerNameDelimiter + stateOrder[0])) {
              stateCount[0] = t.value * 1;
              updateDots('update');
            }
          });
        }

        // trigger first render
        updateDots();
      }
    });
  }

  /** @override */
  async _updateObject(event, formData) {
    if (!formData.data) formData = expandObject(formData);
    if (formData.data?.characterType === "Changeling") {
      //Adjust the number of touchstones on clarity update
      let touchstones = formData.system.touchstones_changeling ? duplicate(formData.system.touchstones_changeling) : {};
      let touchstone_amount = Object.keys(touchstones).length;
      const clarity_max = formData.system.clarity?.max ? formData.system.clarity.max : this.object.system.clarity.max;

      if (touchstone_amount < clarity_max) {
        while (touchstone_amount < clarity_max) {
          touchstones[touchstone_amount + 1] = "";
          touchstone_amount++;
        }
      } else if (touchstone_amount > clarity_max) {
        while (touchstone_amount > clarity_max) {
          touchstones['-=' + touchstone_amount] = null;
          touchstone_amount -= 1;
        }
      }
      formData.system.touchstones_changeling = touchstones;
    }

    // Update the Item
    await super._updateObject(event, formData);
  }



}