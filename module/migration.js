/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function(version_nums_current, version_nums_migration) {
  ui.notifications.info(`Applying CofD System Migration for version ${game.system.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});
  console.log("Migrating to version " + game.system.version);
  let isError = false;

  // Migrate World Actors
  for ( let a of game.actors.contents ) {
    const updateData = migrateActorData(a, version_nums_current, version_nums_migration);
    try {
      if ( !foundry.utils.isEmpty(updateData) ) {
        console.log(`Migrating Actor entity ${a.name}`);
        await a.update(updateData, {enforceTypes: false});
        if(compareVersion(version_nums_current, [0,6,0])) { // 0.5.0 -> 0.6.0
          if(a.type === "character"){
            await a.createWerewolfForms();
          }
        }
      }
    } catch(err) {
      err.message = `Failed CofD system migration for Actor ${a.name}: ${err.message}`;
      console.error(err);
      isError = true;
    }
  }

  for ( let i of game.items.contents ) {
    try {
      const updateData = migrateItemData(i, version_nums_current, version_nums_migration);
      if ( !foundry.utils.isEmpty(updateData) ) {
        console.log(`Migrating Item entity ${i.name}`);
        await i.update(updateData, {enforceTypes: false});
      }
    } catch(err) {
      err.message = `Failed CofD system migration for Item ${i.name}: ${err.message}`;
      console.error(err);
      isError = true;
    }
  }

  // Migrate Actor Override Tokens
  for ( let s of game.scenes.contents ) {
    try {
      const updateData = migrateSceneData(s, version_nums_current, version_nums_migration);
      if ( !foundry.utils.isEmpty(updateData) ) {
        console.log(`Migrating Scene entity ${s.name}`);
        await s.update(updateData, {enforceTypes: false});
        s.tokens.forEach(t => t._actor = null);
      }
    } catch(err) {
      err.message = `Failed CofD system migration for Scene ${s.name}: ${err.message}`;
      console.error(err);
      isError = true;
    }
  }

  // Migrate World Compendium Packs
  for ( let p of game.packs ) {
    if ( p.metadata.package !== "world" ) continue;
    if ( !["Actor", "Item", "Scene"].includes(p.documentName) ) continue;
    await migrateCompendium(p, version_nums_current, version_nums_migration);
  }

  // Set the migration as complete
  if(isError) {
    ui.notifications.error(`An error occured during the system migration. Please check the console (F12) for details.`, {permanent: true});
  }
  else {
    game.settings.set("mta", "systemMigrationVersion", game.system.version);
    console.log("Migration completed!");
    ui.notifications.info(`CofD System Migration to version ${game.system.version} completed!`, {permanent: true});
  }
};

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
 export const migrateCompendium = async function(pack, version_nums_current, version_nums_migration) {
  const documentName = pack.documentName;
  if ( !["Actor", "Item", "Scene"].includes(documentName) ) return;

  // Unlock the pack for editing
  const wasLocked = pack.locked;
  await pack.configure({locked: false});

  // Begin by requesting server-side data model migration and get the migrated content
  await pack.migrate();
  const documents = await pack.getDocuments();

  // Iterate over compendium entries - applying fine-tuned migration functions
  for ( let doc of documents ) {
    let updateData = {};
    try {
      switch (documentName) {
        case "Actor":
          updateData = migrateActorData(doc, version_nums_current, version_nums_migration);
          break;
        case "Item":
          updateData = migrateItemData(doc, version_nums_current, version_nums_migration);
          break;
        case "Scene":
          updateData = migrateSceneData(doc, version_nums_current, version_nums_migration);
          break;
      }
      if ( foundry.utils.isEmpty(updateData) ) continue;

      // Save the entry, if data was changed
      updateData["_id"] = doc._id;
      await doc.update(updateData);
      console.log(`Migrated ${documentName} entity ${doc.name} in Compendium ${pack.collection}`);
    }

    // Handle migration failures
    catch(err) {
      err.message = `Failed cofd system migration for entity ${doc.name} in pack ${pack.collection}: ${err.message}`;
      console.error(err);
    }
  }

  // Apply the original locked status for the pack
  pack.configure({locked: wasLocked});
  console.log(`Migrated all ${documentName} entities from Compendium ${pack.collection}`);
};


/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
export const migrateActorData = function(actor, version_nums_current, version_nums_migration) {
  const updateData = {};

  if(compareVersion(version_nums_current, [0,3,0]) && actor.type === "character" && actor.system.characterType === "Sleeper") updateData["system.characterType"] = "Mortal"; // 0.2.3 -> 0.3.0
  if(compareVersion(version_nums_current, [0,4,0]) && actor.type === "character" && actor.system.goblinDebt){ // 0.3.4 -> 0.4.0 in certain edge cases
    if(actor.system.goblinDebt.max < 10 ) updateData["system.goblinDebt.max"] = 10;
  }
  if(compareVersion(version_nums_current, [0,6,0])) { // 0.5.0 -> 0.6.0

    if(actor.type === "character"){
      if(actor.system.attributes?.physical) updateData["system.attributes_physical"] = duplicate(actor.system.attributes.physical);
      if(actor.system.attributes?.social) updateData["system.attributes_social"] = duplicate(actor.system.attributes.social);
      if(actor.system.attributes?.mental) updateData["system.attributes_mental"] = duplicate(actor.system.attributes.mental);
      updateData['system.-=attributes'] = null;

      if(actor.system.skills?.physical) updateData["system.skills_physical"] = duplicate(actor.system.skills.physical);
      if(actor.system.skills?.social) updateData["system.skills_social"] = duplicate(actor.system.skills.social);
      if(actor.system.skills?.mental) updateData["system.skills_mental"] = duplicate(actor.system.skills.mental);
      updateData['system.-=skills'] = null;

      if(actor.system.arcana?.gross) updateData["system.arcana_gross"] = duplicate(actor.system.arcana.gross);
      if(actor.system.arcana?.subtle) updateData["system.arcana_subtle"] = duplicate(actor.system.arcana.subtle);
      updateData['system.-=arcana'] = null;

      if(actor.system.gnosis && actor.system.wisdom) updateData["system.mage_traits"] = {gnosis: actor.system.gnosis, wisdom: actor.system.wisdom};
      updateData['system.-=gnosis'] = null;
      updateData['system.-=wisdom'] = null;

      if(actor.system.disciplines?.common) updateData["system.disciplines_common"] = duplicate(actor.system.disciplines.common);
      if(actor.system.disciplines?.unique) updateData["system.disciplines_unique"] = duplicate(actor.system.disciplines.unique);
      if(actor.system.disciplines?.own) updateData["system.disciplines_own"] = duplicate(actor.system.disciplines.own);
      updateData['system.-=disciplines'] = null;

      if(actor.system.bloodPotency && actor.system.humanity) updateData["system.vampire_traits"] = {bloodPotency: actor.system.bloodPotency, humanity: actor.system.humanity};
      updateData['system.-=bloodPotency'] = null;
      updateData['system.-=humanity'] = null;

      if(actor.system.wyrd) updateData["system.changeling_traits"] = {wyrd: actor.system.wyrd};
      updateData['system.-=wyrd'] = null;
    }

    if(actor.type === "ephemeral"){
      if(actor.system.power) updateData["system.eph_physical"] = {power: duplicate(actor.system.power)};
      if(actor.system.finesse) updateData["system.eph_social"] = {finesse: duplicate(actor.system.finesse)};
      if(actor.system.resistance) updateData["system.eph_mental"] = {resistance: duplicate(actor.system.resistance)};
      updateData['system.-=power'] = null;
      updateData['system.-=finesse'] = null;
      updateData['system.-=resistance'] = null;
    }

    if(actor.system.sizeMod && actor.system.speedMod && actor.system.defenseMod && actor.system.armorMod && actor.system.initiativeModMod && actor.system.ballisticMod && actor.system.perceptionMod){ 
      updateData["system.derivedTraits"] = {
        size: {value: 0, mod: actor.system.sizeMod},
        speed: {value: 0, mod: actor.system.speedMod},
        defense: {value: 0, mod: actor.system.defenseMod},
        armor: {value: 0, mod: actor.system.armorMod},
        initiativeMod: {value: 0, mod: actor.system.initiativeModMod},
        ballistic: {value: 0, mod: actor.system.ballisticMod},
        perception: {value: 0, mod: actor.system.perceptionMod}
      };

      updateData['system.-=size'] = null;
      updateData['system.-=speed'] = null;
      updateData['system.-=defense'] = null;
      updateData['system.-=armor'] = null;
      updateData['system.-=initiativeMod'] = null;
      updateData['system.-=ballistic'] = null;
      updateData['system.-=perception'] = null;

      updateData['system.-=sizeMod'] = null;
      updateData['system.-=speedMod'] = null;
      updateData['system.-=defenseMod'] = null;
      updateData['system.-=armorMod'] = null;
      updateData['system.-=initiativeModMod'] = null;
      updateData['system.-=ballisticMod'] = null;
      updateData['system.-=perceptionMod'] = null;
    }
  }
  if(compareVersion(version_nums_current, [0,12,0])) { // 0.11.0 -> 0.12.0
    const traitsToClean = [
      "arcana_gross.forces",
      "arcana_gross.life",
      "arcana_gross.matter",
      "arcana_gross.space",
      "arcana_gross.time",
      "arcana_subtle.death",
      "arcana_subtle.fate",
      "arcana_subtle.mind",
      "arcana_subtle.prime",
      "arcana_subtle.spirit",
    ]
    traitsToClean.forEach(t => {
      updateData[`system.${t}.-=max`] = null;
      updateData[`system.${t}.-=min`] = null;
      updateData[`system.${t}.-=type`] = null;
      updateData[`system.${t}.-=label`] = null;
    });

    const traitsToModify = [
      "mage_traits.gnosis", 
      "mage_traits.wisdom", 
      "mage_traits.joining",
      "vampire_traits.bloodPotency",
      "vampire_traits.humanity",
      "werewolf_traits.harmony",
      "werewolf_traits.primalUrge",
      "changeling_traits.mantle",
      "changeling_traits.wyrd",
      "demon_traits.primum"
    ]
    traitsToModify.forEach(trait => {
      const traitValue = trait.split('.').reduce((o,i) => {
        if(o != undefined && o[i] != undefined ) return o[i];
        else return undefined;
      }, actor.system);
      if(!Number.isInteger(traitValue)) return;
      updateData['system.' + trait] = {
        value: traitValue
      }
    });
    
  }

  // Migrate Owned Items
  if ( !actor.items ) return updateData;

  const items = actor.items.reduce((arr, i) => {
    // Removes all items which should not be on the character
    // warning: potentially destructive
    /* if(_isNotAllowedItemType(i, actor)) {
      i.delete()
      return arr;
    } */

    // Migrate the Owned Item
    const itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i;
    let itemUpdate = migrateItemData(itemData, version_nums_current, version_nums_migration);

    // Update the Owned Item
    if ( !foundry.utils.isEmpty(itemUpdate) ) {
      itemUpdate._id = itemData._id;
      arr.push(foundry.utils.expandObject(itemUpdate));
    }

    return arr;
  }, []);

  if ( items.length > 0 ) updateData.items = items;

  return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Item entity to incorporate latest data model changes
 * @param item
 */
export const migrateItemData = function(item, version_nums_current, version_nums_migration) {
  const updateData = {};

  if(compareVersion(version_nums_current, [0,3,0]) && item.type === "melee" && !item.system.weaponType) updateData["system.weaponType"] = "Melee"; // 0.2.3 -> 0.3.0

  if(compareVersion(version_nums_current, [0,6,0])) { // 0.5.0 -> 0.6.0
    if(item.system.arcanum){
      if(item.system.arcanum === "Forces") updateData["system.arcanum"] = "forces";
      else if(item.system.arcanum === "Life") updateData["system.arcanum"] = "life";
      else if(item.system.arcanum === "Matter") updateData["system.arcanum"] = "matter";
      else if(item.system.arcanum === "Space") updateData["system.arcanum"] = "space";
      else if(item.system.arcanum === "Time") updateData["system.arcanum"] = "time";
      else if(item.system.arcanum === "Death") updateData["system.arcanum"] = "death";
      else if(item.system.arcanum === "Fate") updateData["system.arcanum"] = "fate";
      else if(item.system.arcanum === "Mind") updateData["system.arcanum"] = "mind";
      else if(item.system.arcanum === "Prime") updateData["system.arcanum"] = "prime";
      else if(item.system.arcanum === "Spirit") updateData["system.arcanum"] = "spirit";
    }
    if(item.system.effects) updateData["system.effects"] = [];
  }

  if(compareVersion(version_nums_current, [0,9,0])) { // 0.8.0 -> 0.9.0
    if(item.type === "form") { // Werewolf forms buff over 5
      if(item.system.effects) {
        updateData["system.effects"] = duplicate(item.system.effects);
        for(let i = 0; i < updateData["system.effects"].length; i++) {
          updateData["system.effects"][i].overFive = true;
        }
      }
    }
  }
  if(compareVersion(version_nums_current, [0,12,0])) { // 0.11.0 -> 0.12.0
    const t = ["armor", "firearm", "melee", "equipment"];
    if(t.includes(item.type)) {
      if(item.system.effectsActive) {
        updateData["system.effectsActive"] = false;
        updateData["system.equipped"] = true;
      }
    }
  }

  return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
 * Return an Object of updateData to be applied
 * @param {Object} scene  The Scene data to Update
 * @return {Object}       The updateData to apply
 */


export const migrateSceneData = function(scene, version_nums_current, version_nums_migration) {
  const tokens = scene.tokens.map(token => {
    const t = token.toObject();

    if (!t.actorId || t.actorLink) {
      t.actorData = {};
    }
    else if ( !game.actors.has(t.actorId) ){
      t.actorId = null;
      t.actorData = {};
    }
    else if ( !t.actorLink ) {
      const actorData = duplicate(t.actorData);
      actorData.type = token.actor?.type;
      const update = migrateActorData(actorData, version_nums_current, version_nums_migration);

      // Migrate embedded documents
      ["items", "effects"].forEach(embeddedName => {
        if (!update[embeddedName]?.length) return;
        const updates = new Map(update[embeddedName].map(u => [u._id, u]));
        t.actorData[embeddedName].forEach(original => {
          const u = updates.get(original._id);
          if (u) foundry.utils.mergeObject(original, u);
        });
        delete update[embeddedName];
      });

      mergeObject(t.actorData, update);
    }
    return t;
  });
  
  return {tokens};
};


/* -------------------------------------------- */
/*  Low level migration utilities
/* -------------------------------------------- */

/**
 * Converts all properties with value null to value undefined,
 * in order to let the mergeObject function replace these values.
 * @private
 */
function _nullToUndefined(data, recDepth) {
  if(typeof data !== 'object' || Array.isArray(data)) return data;
  if(data === null) return undefined;
  Object.entries(data).forEach(ele => {
    if(ele[1] === null){ data[ele[0]] = undefined;}
    else if((recDepth > 0) && (toString.call(ele[1]) == '[object Object]') && (Object.keys(ele[1]).length > 0)){
      data[ele[0]] = _nullToUndefined(ele[1], recDepth-1); 
    } 
  });
  return data;
}

// Returns true  if the current version is lower than the migration version
export const compareVersion = function(version_nums_current, version_nums_migration) {
  return (version_nums_current[0] < version_nums_migration[0]) || (version_nums_current[0] === version_nums_migration[0] && version_nums_current[1] < version_nums_migration[1]) || (version_nums_current[0] === version_nums_migration[0] && version_nums_current[1] === version_nums_migration[1] && version_nums_current[2] < version_nums_migration[2]);
}

// Returns true if the item should not be on the actor
function _isNotAllowedItemType(item, actor) {
  if(actor.type === "ephemeral") {
    return CONFIG.MTA.characterItemTypes.includes(item.type);
  }
  if(actor.type === "character") {
    return CONFIG.MTA.ephemeralItemTypes.includes(item.type);
  }
  return false;
}