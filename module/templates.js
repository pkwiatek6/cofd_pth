import { MTA } from "./config.js";
/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [
    // Actor Sheet Partials
    "systems/mta/templates/actors/parts/base-attributes.hbs",
    "systems/mta/templates/actors/parts/base-inventory.hbs",
    "systems/mta/templates/actors/parts/vamp-disciplines.hbs",
    "systems/mta/templates/actors/parts/mage-magic.hbs",
    "systems/mta/templates/actors/parts/changeling-powers.hbs",
    "systems/mta/templates/actors/parts/werewolf-gifts.hbs",
    "systems/mta/templates/actors/parts/demon-embeds.hbs",
    "systems/mta/templates/actors/parts/hunter-endowments.hbs",
    "systems/mta/templates/actors/parts/princess-charms.hbs"
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};

export const registerHandlebarsHelpers = function () {
  Handlebars.registerHelper('isMagCol', function (value) {
    return value === 3;
  });
  Handlebars.registerHelper('eqAny', function () {
    for (let i = 1; i < arguments.length; i++) {
      if (arguments[0] === arguments[i]) {
        return true;
      }
    }
    return false;
  });
  Handlebars.registerHelper('scelestiRankHigherThan', function (value, rank) {
    return MTA.scelestiRanks.indexOf(value) >= MTA.scelestiRanks.indexOf(rank);
  });
  Handlebars.registerHelper('convertVampTouchstone', function (value) {
    let newValues = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    return newValues[value - 1];
  });

  Handlebars.registerHelper('isActiveVampTouchstone', function (value, integrity) {
    let newValues = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    let newValue = newValues[value - 1];
    return newValue <= integrity;
  });

  Handlebars.registerHelper('isActiveTouchstoneChangeling', function (value, composure) {
    return value >= composure + 1;
  });

  Handlebars.registerHelper('convertBool', function (value) {
    return value === true ? "Yes" : "No";
  });

  Handlebars.registerHelper('isGoblinContract', function (value) {
    return value === "Goblin";
  });

  Handlebars.registerHelper('breaklines', function (text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\n)/gm, '<br>');
    return new Handlebars.SafeString(text);
  });

  Handlebars.registerHelper('addPlus', function (value) {
    return value >= 0 ? "+" + value : value;
  });

  Handlebars.registerHelper('posneg', function (value, comp) {
    return value >= comp ? "positive" : "negative";
  });

  Handlebars.registerHelper('posnegTwoVal', function (value, value2, comp) {
    return (value >= comp && value2 >= comp) ? "positive" : "negative";
  });

  Handlebars.registerHelper('addBrackets', function (value) {
    return Number.isInteger(value) ? "(" + value + ")" : "";
  });

  Handlebars.registerHelper('chooseNum', function (value1, value2) {
    return Number.isInteger(value1) ? value1 : Number.isInteger(value2) ? value2 : 0;
  });

  Handlebars.registerHelper('isInteger', function (value) {
    return Number.isInteger(value);
  });

  Handlebars.registerHelper('scaleIndex', function (value) {
    let scaleIndex = CONFIG.MTA.spell_casting.scale.standard.findIndex(v => (v === value));
    if (scaleIndex < 0) scaleIndex = CONFIG.MTA.spell_casting.scale.advanced.findIndex(v => (v === value));
    if (scaleIndex < 0) scaleIndex = 0
    else scaleIndex++;
    return scaleIndex;
  });

  Handlebars.registerHelper('translate', function (value) { //Unused?
    if (CONFIG.MTA.attributes_physical[value]) return CONFIG.MTA.attributes_physical[value];
    else if (CONFIG.MTA.attributes_social[value]) return CONFIG.MTA.attributes_social[value];
    else if (CONFIG.MTA.attributes_mental[value]) return CONFIG.MTA.attributes_mental[value];
    else if (CONFIG.MTA.skills_physical[value]) return CONFIG.MTA.skills_physical[value];
    else if (CONFIG.MTA.skills_social[value]) return CONFIG.MTA.skills_social[value];
    else if (CONFIG.MTA.skills_mental[value]) return CONFIG.MTA.skills_mental[value];
    else if (CONFIG.MTA.derivedTraits[value]) return CONFIG.MTA.derivedTraits[value];
    else if (CONFIG.MTA.arcana[value]) return CONFIG.MTA.arcana[value];
    else if (CONFIG.MTA.hunter_traits[value]) return CONFIG.MTA.hunter_traits[value];
    else if (CONFIG.MTA.princess_traits[value]) return CONFIG.MTA.princess_traits[value];
    else return "ERROR";
  });

  Handlebars.registerHelper('getMagicalColor', function (magicType, magicClass) {
    if (CONFIG.MTA.magicItemColors[magicClass]) return CONFIG.MTA.magicItemColors[magicClass];
    else if (CONFIG.MTA.magicItemColors[magicType]) return CONFIG.MTA.magicItemColors[magicType];
    else return CONFIG.MTA.magicItemColors.Default;
  });

  Handlebars.registerHelper('translateTrait', function (value) {
    return value.split('.').reduce((o, i) => o[i], CONFIG.MTA);
  });

  Handlebars.registerHelper('isArcadian', function (value) {
    return value === "Arcadian";
  });

  Handlebars.registerHelper('isCourt', function (value) {
    return value === "Court";
  });

  Handlebars.registerHelper('isGoblin', function (value) {
    return value === "Goblin";
  });

  Handlebars.registerHelper('usesJoining', function (characterType, scelestiRank) {
    return characterType === "Scelesti" && MTA.scelestiRanks.indexOf(scelestiRank) >= MTA.scelestiRanks.indexOf("Nasnas");
  });

  // Return enriched text WITH secret blocks if the user is GM and otherwise WITHOUT
  Handlebars.registerHelper("enrichHTML", function (value, object) {
    let secrets = false;
    if (object) secrets = object.isOwner;
    if (game.user.isGM) secrets = true;
    //enrichHTML(content, secrets, entities, links, rolls, rollData) → {string}
    return TextEditor.enrichHTML(value, { secrets: secrets, entities: true, async: false });
  })

  function resolveTrait(actor, args) {
    args.pop(); // Las parameter is the element for some reason
    const traitName = args.join('.');
    const trait = traitName.split('.').reduce((o, i) => {
      if ((o != undefined)) return o[i];
      else return undefined;
    }, actor.system);

    return { traitName, trait }
  }

  function traitsList(traits, selected) {
    return Object.values(traits).reduce((acc, cur) =>
      acc + `<optgroup label="${game.i18n.localize(cur.name)}">
        ${Object.entries(cur.list).reduce((acc_b, [key, value]) =>
        acc_b + `<option value="${key}" ${key === selected ? 'selected' : ''}>${value}</option>
        `, "")}
      </optgroup>`
      , "");
  }

  Handlebars.registerHelper('dicePoolList', function (sheet) {

    const macro = game.macros.get(sheet.system.dicePool.macro);
    const macro_name = macro ? macro.name : '';
    const macro_string = Array.from(game.macros.keys()).reduce((acc, cur) => acc + '/' + cur, '');
    return `
    <div class="form-line attributeList">
      <label>${game.i18n.localize("MTA.DicePool")}</label> 
      <span class="stoneButton dicePoolAdd">+</span>
      ${sheet.system.dicePool.attributes.reduce((acc, cur, index) =>
      acc + `<select name="system.dicePool.attributes.${index}">
          ${traitsList(sheet.all_traits, cur)}
        </select>
      <span class="stoneButton dicePoolRemove" data-index=${index}>-</span>
      `, '')}
      <span class="wide">
        + <input name="system.dicePool.value" type="number" data-dtype="Number" placeholder=0 value="${sheet.system.dicePool.value}" />
      </span>
      <label>Macro</label>
      <input name="system.dicePool.macro" type="text" value="${sheet.system.dicePool.macro}" data-koptions="${macro_string}"/>
      ${macro_name ? `
      <label class="wide small">
        ${macro_name}
      </label>
      `: ''}
      <label>Comment</label>
      <textarea name="system.dicePool.comment" placeholder="E.g. withstand">${sheet.system.dicePool.comment}</textarea>
  </div>`
  });


  Handlebars.registerHelper('effectList', function (sheet) {
    return `
    <div class="form-line attributeList">
      ${'equipped' in sheet.system ? '' : `
        <label>${game.i18n.localize("MTA.Active")}</label>
        <label class="checkBox">
          <input data-dtype="Boolean" name="system.effectsActive" type="checkbox" ${sheet.system.effectsActive ? 'checked' : ''}>
          <span></span>
        </label><hr><hr>
      `}
      <label>${game.i18n.localize("MTA.Effects")}</label>
      <span class="stoneButton effectAdd">+</span>
      ${sheet.system.effects.reduce((acc, cur, index) =>
      acc + `<span>
        <select name="system.effects.${index}.name">
          ${traitsList(sheet.all_traits, cur.name)}
        </select>
        <input name="system.effects.${index}.value" type="number" data-dtype="Number" value="${cur.value}" />
        <label class="checkBox overFive" title="Can increase traits above five (or splat-specific power trait maximum)?">
          <input data-dtype="Boolean" name="system.effects.${index}.overFive" type="checkbox" ${cur.overFive ? 'checked' : ''}>
          <span></span>
        </label>

      </span>
      <span class="stoneButton effectRemove" data-index=${index}>-</span>`
      , "")}
    </div>`
  });

  Handlebars.registerHelper('bigStatBox', function (actor, delimiter, ...args) {
    let { traitName, trait } = resolveTrait(actor, args);

    if (trait === null) trait = 0;

    if (trait == undefined) {
      console.error("Failed to construct input", trait, traitName)
      return;
    }

    const isInteger = Number.isInteger(trait);
    let traitValue = isInteger ? trait : trait.value;
    if (traitValue == undefined) traitValue = 0;
    if (delimiter && isInteger) {
      console.error("Failed to construct input", trait, traitName)
      return;
    }
    let traitValueMax = trait.max;
    if (traitValueMax == undefined) traitValueMax = 0;
    const localisedName = game.i18n.localize("MTA." + traitName);

    // TODO: Support x_per_turn and calculateMaxResource button

    return `
    <div class="kInput statBox big">
        <h4>
          <input class="attribute-check" id="${actor._id + traitName}" data-trait="${traitName}" type="checkbox" data-dtype="Boolean">
          <label class="button attribute-button" for="${actor._id + traitName}">${localisedName}</label>
        </h4>
        <div class="gold-border"></div>
        <div class="split">
          <div class="niceNumber buttonsLeft">            
            <input type="number" name="system.${isInteger ? traitName : traitName + ".value"}" value=${traitValue} data-dtype="Number" min=0 max=999>
            <span class="attribute-mod ${trait.isModified ? (`${trait.final >= trait.value ? "positive" : "negative"}`) : ''}">${trait.isModified ? (Number.isInteger(trait.final) ? "(" + trait.final + ")" : "") : ''}</span>
            <div class="numBtns">
              <div class="plusBtn">+</div>
              <div class="minusBtn">−</div>
            </div>
          </div>
          ${delimiter ? `
            <span class="delimiter"> / </span>
            <div class="niceNumber">
              <input type="number" name="system.${isInteger ? traitName : traitName + ".max"}" value=${traitValueMax} data-dtype="Number" min=0 max=999>
              <div class="numBtns">
                <div class="plusBtn">+</div>
                <div class="minusBtn">−</div>
              </div>
            </div>
            `: ''}
        </div>
      </div>`
  });

  Handlebars.registerHelper('rollableInput', function (actor, ...args) {
    let { traitName, trait } = resolveTrait(actor, args);

    if (trait === null) trait = 0;
    if (trait == undefined) {
      console.error("Failed to construct input", traitName)
      return;
    }

    const isSkill = traitName.split('.')[0] === "skills_physical" || traitName.split('.')[0] === "skills_social" || traitName.split('.')[0] === "skills_mental";
    const canBeRoteSkill = actor.system.characterType === "Mage" && isSkill; // FIXME: or scelesti, etc.

    const isArcanum = traitName.split('.')[0] === "arcana_subtle" || traitName.split('.')[0] === "arcana_gross";
    const isRenown = traitName.split('.')[0] === "werewolf_renown";

    const isInteger = Number.isInteger(trait);
    let traitValue = isInteger ? trait : trait.value;
    if (traitValue == undefined) traitValue = 0;
    const localisedName = game.i18n.localize("MTA." + traitName);
    return `
    <li class="attribute flexrow rollableInput">
      <span>
        ${canBeRoteSkill ? `
        <label class="checkBox">
          <input data-dtype="Boolean" name="system.${traitName}.isRote" type="checkbox" ${trait.isRote ? 'checked' : ''}>
          <span></span>
        </label>` : ''}
        ${isArcanum ? `
        <span class="button arcana-state ${trait.isRuling ? 'ruling' : trait.isInferior ? 'inferior' : ''}" title="${trait.isRuling ? game.i18n.localize('MTA.RulingArcanum') : trait.isInferior ? game.i18n.localize('MTA.InferiorArcanum') : ""}" data-trait="${traitName}">${trait.isRuling ? game.i18n.localize('MTA.RulingShort') : trait.isInferior ? game.i18n.localize('MTA.InferiorShort') : ""}</span>
        ` : ''}
        ${isRenown ? `
        <span class="button renown-state ${trait.isAuspice ? 'auspice' : trait.isTribe ? 'tribe' : ''}" title="${trait.isAuspice ? game.i18n.localize('MTA.Auspice') : trait.isTribe ? game.i18n.localize('MTA.Tribe') : ''}" data-trait="${traitName}">${trait.isAuspice ? game.i18n.localize('MTA.AuspiceShort') : trait.isTribe ? game.i18n.localize('MTA.TribeShort') : ''}</span>
        ` : ''}
        ${isSkill ? `
        <span class="button skill-specialty tooltip ${trait.specialties?.length ? 'available' : ''} ${trait.isAssetSkill ? 'asset' : ''}" data-trait="${traitName}"><i class="fa-solid fa-diamond"></i>
          ${trait.specialties?.length ? `
            <span class="tooltip-text">
              <ul>
                ${trait.specialties.reduce((prev, cur) => prev + `<li>${cur}</li>`, '')}
              </ul>
            </span>
          `: ''}
        </span>` : ''}
        <span>
            <input class="attribute-check" id="${actor._id + traitName}" data-trait="${traitName}" type="checkbox" data-dtype="Boolean">
            <label class="button attribute-button" for="${actor._id + traitName}">${localisedName}</label>
        </span>
      </span>
      <span>
        <span class="attribute-mod ${trait.isModified ? (`${trait.final >= trait.value ? "positive" : "negative"}`) : ''}">${trait.isModified ? (Number.isInteger(trait.final) ? "(" + trait.final + ")" : "") : ''}</span>
        <input class="attribute-value" type="number" name="system.${isInteger ? traitName : traitName + ".value"}" value=${traitValue} data-dtype="Number" min=0 max=999>
    </span>
  </li>`
  });
  Handlebars.registerHelper('localizeCharmType', function (charmType) {
    // Lookup the localization key using the charmType
    const localizationKey = MTA.charmTypes[charmType];
    // Return the localized string
    return game.i18n.localize(localizationKey);
  });
}