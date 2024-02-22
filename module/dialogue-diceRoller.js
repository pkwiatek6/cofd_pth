export class DiceRollerDialogue extends Application {
  constructor({dicePool=0, targetNumber=8, extended=false, target_successes=0, penalty=0, flavor="Skill Check", addBonusFlavor=false, title="Skill Check", blindGMRoll=false, actorOverride=undefined, damageRoll=false, weaponDamage=0, armorPiercing=0, itemName="", itemImg="", itemRef=undefined, itemDescr="", spendAmmo=false, advancedAction=false, macro, actor={}, token={}, comment=""}, ...args){
    super(...args);
    this.targetNumber = +targetNumber;
    this.dicePool = +dicePool;
    this.penalty = penalty;
    this.flavor = flavor;
    this.addBonusFlavor = addBonusFlavor;
    this.blindGMRoll = blindGMRoll;
    this.options.title = title;
    this.actorOverride = actorOverride;
    this.damageRoll = damageRoll;
    this.weaponDamage = weaponDamage;
    this.armorPiercing = armorPiercing;
    this.itemName = itemName;
    this.itemImg = itemImg;
    this.itemRef = itemRef;
    this.itemDescr = itemDescr;
    this.spendAmmo = spendAmmo;
    this.accumulatedSuccesses = 0;
    this.extendedRolls = 0;
    this.extended = extended;
    this.target_successes = target_successes;
    this.advancedAction = advancedAction;
    this.macro = macro;
    this.actor = actor;
    this.token = token;
    this.comment = comment;
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["worldbuilding", "dialogue", "mta-sheet"],
  	  template: "systems/mta/templates/dialogues/dialogue-diceRoller.html",
      resizable: true
    });
  }
  
  getData() {
    const data = super.getData();
    data.targetNumber = this.targetNumber;
    data.dicePool = this.dicePool;
    data.bonusDice = 0;
    data.spendAmmo = this.spendAmmo;
    data.ammoPerShot = 1;
    data.penalty = this.penalty;
    data.extended = this.extended;
    data.advancedAction =this. advancedAction;
    
    if(game.settings.get("mta", "showRollDifficulty")) data.enableDifficulty = true;

    return data;
  }
  
  _fetchInputs(html){
    const dicePool_userMod_input = html.find('[name="dicePoolBonus"]');
    const dicePool_difficulty_input = html.find('[name="dicePoolDifficulty"]');
    const ammoPerShot_input = html.find('[name="ammoPerShot"]');
    
    let dicePool_userMod = dicePool_userMod_input.length ? +dicePool_userMod_input[0].value : 0;
    let explode_threshold = Math.max(0,+($('input[name=explodeThreshold]:checked').val()));
    let rote_action = $('input[name=rote_action]').prop("checked");
    let advancedAction = $('input[name=advancedAction]').prop("checked");
    let extended = $('input[name=extended]').prop("checked");

    let dicePool_difficulty 
    if(game.settings.get("mta", "showRollDifficulty")) dicePool_difficulty = dicePool_difficulty_input.length ? +dicePool_difficulty_input[0].value : 0;
    else dicePool_difficulty = 8;

    let ammoPerShot = ammoPerShot_input.length ? +ammoPerShot_input[0].value : 0;
    
    return {dicePool_userMod: dicePool_userMod, explode_threshold: explode_threshold, rote_action: rote_action, dicePool_difficulty: dicePool_difficulty, ammoPerShot: ammoPerShot, advancedAction: advancedAction, extended: extended}
  }
  
  activateListeners(html) {
    super.activateListeners(html);
    
    html.find('.roll-execute').click(ev => this._executeRoll(html, ev));
  }
  
  async _executeRoll(html, ev) {
    const modifiers = this._fetchInputs(html);
    const dicePool = this.dicePool + modifiers.dicePool_userMod;
    const roteAction = modifiers.rote_action;
    const flavor = (this.flavor || "Skill Check")
                 + (modifiers.dicePool_userMod>0 ? " + " + modifiers.dicePool_userMod : modifiers.dicePool_userMod<0 ? " - " + -modifiers.dicePool_userMod : "");
    const explodeThreshold = modifiers.explode_threshold;
    const targetNumber = Math.clamped(modifiers.dicePool_difficulty, 1, 10);
    const rollReturn = {};
    if(this.damageRoll) await DiceRollerDialogue.rollWithDamage({dicePool: dicePool, targetNumber: targetNumber, rollReturn: rollReturn, tenAgain: explodeThreshold===10, nineAgain: explodeThreshold===9, eightAgain: explodeThreshold===8, roteAction: roteAction, flavor: flavor, blindGMRoll: this.blindGMRoll, actorOverride: this.actorOverride, weaponDamage: this.weaponDamage, armorPiercing: this.armorPiercing, itemImg: this.itemImg, itemName: this.itemName, itemRef: this.itemRef, itemDescr: this.itemDescr, spendAmmo: this.spendAmmo, ammoPerShot: modifiers.ammoPerShot, advancedAction: modifiers.advancedAction, comment: this.comment});
    else await DiceRollerDialogue.rollToChat({dicePool: dicePool, targetNumber: targetNumber, extended: modifiers.extended, extended_accumulatedSuccesses: this.accumulatedSuccesses, extended_rolls: this.extendedRolls, extended_rollsMax: this.dicePool, rollReturn: rollReturn, tenAgain: explodeThreshold===10, nineAgain: explodeThreshold===9, eightAgain: explodeThreshold===8, roteAction: roteAction, flavor: flavor, blindGMRoll: this.blindGMRoll, actorOverride: this.actorOverride, advancedAction: modifiers.advancedAction, comment: this.comment});
  
    if(modifiers.extended) {
      let successes = rollReturn.roll.total;
      if(successes > 0) this.accumulatedSuccesses += successes;
      this.extendedRolls++;
    }

    if (this.macro) {
      this.actor.setFlag('mta', 'rollReturn', rollReturn.roll);
      this.macro.execute({actor: this.actor, token: this.actor.token ?? this.actor.getActiveTokens[0]});
    }
  }
  
  static _roll({dicePool=1, targetNumber=8, tenAgain=true, nineAgain=false, eightAgain=false, roteAction=false, chanceDie=false, exceptionalTarget=5, advancedAction=false}){
    //Create dice pool qualities
    const roteActionString = roteAction ? "r<8" : "";
    const explodeString = eightAgain ? "x>=8" : nineAgain ? "x>=9" : tenAgain ? "x>=10" : "" ;
    const targetNumString = chanceDie ? "cs>=10" : "cs>=" + targetNumber;
    
    let roll = new Roll(dicePool + "d10" + roteActionString + explodeString + targetNumString).roll({async: false});
    
    if(chanceDie && roteAction && roll.terms[0].results[0].result === 1){
      //Chance dice don't reroll 1s with Rote quality
      roll.terms[0].results.splice(1);
    }
    if(chanceDie && roll.terms[0].results[0].result === 1) roll.dramaticFailure = true;
    if(roll.total >= exceptionalTarget) roll.exceptionalSuccess = true;


    if(advancedAction) {
      const roll2 = DiceRollerDialogue._roll({dicePool: dicePool, targetNumber: targetNumber, tenAgain: tenAgain, nineAgain: nineAgain, eightAgain: eightAgain, roteAction: roteAction, chanceDie: chanceDie, exceptionalTarget: exceptionalTarget, advancedAction: false});
      if(roll2.total > roll.total) {
        roll2.advancedRoll = roll;
        roll = roll2;
      }
      else {
        roll.advancedRoll = roll2;
      }
    }
    console.log(roll);
    return roll;
  }
  
  
  static async rollToHtml({dicePool=1, targetNumber=8, extended=false, extended_accumulatedSuccesses=0, extended_rolls=0, extended_rollsMax=0, tenAgain=true, nineAgain=false, eightAgain=false, roteAction=false, flavor="Skill Check", showFlavor=true, exceptionalTarget=5, blindGMRoll=false, rollReturn, advancedAction=false, comment=""}){   
    //Is the roll a chance die?
    let chanceDie = false;
    if(dicePool < 1) {
      tenAgain = false;
      chanceDie = true;
      dicePool = 1;
    }
    
    let roll = DiceRollerDialogue._roll({dicePool: dicePool, targetNumber: targetNumber, tenAgain: tenAgain, nineAgain: nineAgain, eightAgain: eightAgain, roteAction: roteAction, chanceDie: chanceDie, exceptionalTarget: exceptionalTarget, advancedAction});
    if(rollReturn) rollReturn.roll = roll;
    //Create Roll Message
    let speaker = ChatMessage.getSpeaker();
    
    if(chanceDie) flavor += " [Chance die]";
    if(roteAction) flavor += " [Rote quality]";
    if(eightAgain) flavor += " [8-again]";
    else if(nineAgain) flavor += " [9-again]";
    else if(tenAgain) flavor += " [10-again]";
    if(!showFlavor) flavor = undefined;

    let chatData = {
      user: game.user.id,
      speaker: speaker,
      flavor: flavor
    };
    let rollMode = blindGMRoll ? "blindroll" : game.settings.get("core", "rollMode");
    chatData = ChatMessage.applyRollMode(chatData, rollMode);

    extended_accumulatedSuccesses += Math.max(0,roll.total);
    extended_rolls++;

    
    let html = await roll.render(chatData);
    if(roll.dramaticFailure) html = html.replace('class="dice-total"', 'class="dice-total dramaticFailure"');
    else if(roll.exceptionalSuccess) html = html.replace('class="dice-total"', 'class="dice-total exceptionalSuccess"');
    if(roll.advancedRoll) {
      let advHtml = await roll.advancedRoll.render(chatData);
      advHtml = advHtml.replace('class="dice-roll"', 'class="dice-roll advancedRoll"');
      console.log("ASD", advHtml);
      html += advHtml;
    }

    if(extended) html += `<div class="roll-extended">
      <div class="roll-extended-header">Extended roll</div>
      <div>${extended_accumulatedSuccesses} successes</div>
      <div>${extended_rolls} / ${extended_rollsMax} rolls</div>
    </div>`;

    if(comment) html += `<div class="comment">${comment.replaceAll('\n', '<br>')}</div>`;

    return html;
  }

  
  static async rollToChat({dicePool=1, targetNumber=8, extended=false, extended_accumulatedSuccesses=0, extended_rolls=0, extended_rollsMax=0, tenAgain=true, nineAgain=false, eightAgain=false, roteAction=false, exceptionalTarget=5, flavor="Skill Check", blindGMRoll=false, actorOverride=undefined, rollReturn={}, advancedAction=false, comment=""}){
    
    const templateData = {
      roll: await DiceRollerDialogue.rollToHtml({
        dicePool: dicePool, 
        targetNumber: targetNumber, 
        tenAgain: tenAgain, 
        nineAgain: nineAgain, 
        eightAgain: eightAgain, 
        roteAction: roteAction, 
        exceptionalTarget: exceptionalTarget, 
        showFlavor: false,
        blindGMRoll: blindGMRoll,
        rollReturn: rollReturn,
        extended: extended,
        extended_accumulatedSuccesses: extended_accumulatedSuccesses,
        extended_rolls: extended_rolls,
        extended_rollsMax: extended_rollsMax,
        advancedAction,
        comment
      })
    };
    
    //Create Roll Message
    let rollMode = blindGMRoll ? "blindroll" : game.settings.get("core", "rollMode");
    let speaker = actorOverride ? ChatMessage.getSpeaker({actor: actorOverride}) : ChatMessage.getSpeaker();
    
    // Render the chat card template
    const template = `systems/mta/templates/chat/roll-template.html`;
    const html = await renderTemplate(template, templateData);

    // Basic chat message data
    let chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      content: html,
      speaker: speaker,
      flavor: flavor,
      sound: CONFIG.sounds.dice,
      roll: rollReturn.roll,
      rollMode: rollMode
    };

    // Toggle default roll mode
    /* if ( ["gmroll", "blindroll"].includes(rollMode) ) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");*/
    //if ( rollMode === "blindroll" ) chatData["blind"] = true; 
    chatData = ChatMessage.applyRollMode(chatData, rollMode);

    // Create the chat message
    return ChatMessage.create(chatData);
  }


  static async rollWithDamage({dicePool=1, 
    targetNumber=8, 
    tenAgain=true, 
    nineAgain=false, 
    eightAgain=false, 
    roteAction=false, 
    exceptionalTarget=5, 
    flavor="Attack", 
    blindGMRoll=false, 
    actorOverride=undefined,
    itemImg = "",
    itemName = "",
    itemDescr = "",
    weaponDamage = 0,
    armorPiercing = 0,
    itemRef=undefined, // for reloading of firearms
    spendAmmo=false,
    ammoPerShot=0, 
    advancedAction=false,
    rollReturn={},
    comment=""
  }) {
    const templateData = {
      data: {
        description: itemDescr,
        rolls: [ {
          title: "Hit Roll",
          html: await DiceRollerDialogue.rollToHtml({
            dicePool: dicePool, 
            targetNumber: targetNumber, 
            tenAgain: tenAgain, 
            nineAgain: nineAgain, 
            eightAgain: eightAgain, 
            roteAction: roteAction, 
            exceptionalTarget: exceptionalTarget, 
            showFlavor: false,
            blindGMRoll: blindGMRoll,
            rollReturn: rollReturn, 
            advancedAction,
            comment
          })
        }],
      },
      item: {
        img: itemImg,
        name: itemName
      }
    };

    templateData.data.summary = rollReturn.roll.total ? (rollReturn.roll.total + weaponDamage) + " damage inflicted!": "Attack missed!"
    if(armorPiercing && rollReturn.roll.total) templateData.data.summary += " (" + armorPiercing + " AP)";
    if(spendAmmo) templateData.data.summaryAddendum = ammoPerShot + " ammo spent";

    if(spendAmmo && ammoPerShot) {
      if(itemRef) {
        if(!itemRef.system.magazine) {
          ui.notifications.error(`No magazine inside the weapon!`);
          return;
        }
        let ammo = itemRef.system.magazine.system.quantity;
        ammo -= ammoPerShot;
        if(ammo < 0) {
          ui.notifications.error(`Not enough ammo available inside the weapon to shoot!`);
          return;
        } else {
          itemRef.update({
            _id: itemRef.id,
            'system.magazine.system.quantity': ammo
          });
        }
      } else {
        ui.notifications.warn(`No weapon reference was given (no ammo subtracted).`);
      }
    }

    //Create Roll Message
    let rollMode = blindGMRoll ? "blindroll" : game.settings.get("core", "rollMode");
    let speaker = actorOverride ? ChatMessage.getSpeaker({actor: actorOverride}) : ChatMessage.getSpeaker();

    // Render the chat card template
    const template = `systems/mta/templates/chat/item-card.html`;
    const html = await renderTemplate(template, templateData);

     // Basic chat message data
     let chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      content: html,
      speaker: speaker,
      flavor: flavor,
      sound: CONFIG.sounds.dice,
      roll: rollReturn.roll,
      rollMode: rollMode
    };

    chatData = ChatMessage.applyRollMode(chatData,rollMode);
    // Create the chat message
    return ChatMessage.create(chatData);
  }
}