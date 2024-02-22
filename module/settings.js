import {
  TokenHealthColorSettingsDialogue
} from "./dialogue-tokenHealthColorSettings.js";
export const registerSystemSettings = function() {

  /**
   * Track the system version upon which point a migration was last applied
   */
  game.settings.register("mta", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
  
  /**
   * Option to automatically collapse Item Card descriptions
   */
  game.settings.register("mta", "autoCollapseItemDescription", {
    name: "Collapse Item Cards in Chat",
    hint: "Automatically collapse Item Card descriptions in the Chat Log",
    scope: "client",
    config: true,
    default: true,
    type: Boolean,
    onChange: s => {
      ui.chat.render();
    }
  });


  /**
   * Option to automatically collapse Item Card descriptions
   */
   game.settings.register("mta", "showRollDifficulty", {
    name: "Show roll difficulty setting",
    hint: "Adds the option to change roll difficulty (target number) in the dice roller",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: s => {
      
    }
  });

  game.settings.register("mta", "lowerDefense", {
    name: "Homebrew rule: lower defense rating",
    hint: "Lowers defense values of characters to more reasonable values. Normal characters now calculate their defense rating with the lowest of their Dexterity and Wits.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true
  });

  game.settings.register("mta", "showConditionsOnTokens", {
    name: "Show Conditions icons on Tokens",
    hint: "Determines whether Conditions are shown as status icons on Tokens for the user",
    scope: "client",
    config: true,
    default: true,
    type: Boolean,
    onChange: s => {
      //TODO:
    }
  });

  game.settings.register('mta', 'tokenHealthColorHealthy', {
    name: 'Token health color (healthy)',
    scope: 'client',
    config: false,
    type: String,
    default: '#000000',
    onChange: value => {
    }
  });

  game.settings.register('mta', 'tokenHealthColorBashing', {
    name: 'Token health color (bashing)',
    scope: 'client',
    config: false,
    type: String,
    default: '#eaba0a',
    onChange: value => {
    }
  });

  game.settings.register('mta', 'tokenHealthColorLethal', {
    name: 'Token health color (lethal)',
    scope: 'client',
    config: false,
    type: String,
    default: '#d37313',
    onChange: value => {
    }
  });

  game.settings.register('mta', 'tokenHealthColorAggravated', {
    name: 'Token health color (aggravated)',
    scope: 'client',
    config: false,
    type: String,
    default: '#a52525',
    onChange: value => {
    }
  });

  // Define a settings submenu which handles advanced configuration needs
  game.settings.registerMenu("mta", "TokenHealthColorSettingsMenu", {
    name: "Token health color settings",
    label: "Token health color settings",     
    hint: "Change the colors for the various damage types on token resource 'health' bars.",
    icon: "fas fa-bars",               // A Font Awesome icon used in the submenu button
    type: TokenHealthColorSettingsDialogue,   // A FormApplication subclass which should be created
    restricted: false                   // Restrict this submenu to gamemaster only?
  });
};
