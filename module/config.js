/**
 * WARNING: Remember, if you change anything in this file, it will get overwritten when the system updates. 
 * So make a backup of any changes, and re-apply them afterwards.
 */

// Namespace Configuration Values
export const MTA = {};

const path = 'systems/mta/icons/placeholders/';


/**
 * The paths to the individual placeholder icons
 * for each item type within the system.
 * Feel free to modify, but add the corresponding
 * icon in the placeholder path.
 * Note: There is a bug in Firefox with svg icons which
 * have an explicity width and height.
*/
MTA.placeholders = new Map([
  ["condition", path + 'Condition.svg'],
  ["tilt", path + 'Tilt.svg'],
  ["environmental", path + 'EnvironmentalTilt.svg'],
  ["death", path + "Death.svg"],
  ["fate", path + "Fate.svg"],
  ["forces", path + "Forces.svg"],
  ["life", path + "Life.svg"],
  ["matter", path + "Matter.svg"],
  ["mind", path + "Mind.svg"],
  ["prime", path + "Prime.svg"],
  ["space", path + "Space.svg"],
  ["spirit", path + "Spirit.svg"],
  ["time", path + "Time.svg"],
  ["relationship", path + 'Relationship.svg'],
  ["vinculum", path + 'Relationship.svg'],
  ["service", path + 'Service.svg'],
  ["container", path + 'Container.svg'],
  ["merit", path + 'Merit.svg'],
  ["yantra", path + 'Yantra.svg'],
  ["firearm", path + 'Firearm.svg'],
  ["melee", path + 'Melee.svg'],
  ["unarmed", path + 'Unarmed.svg'],
  ["thrown", path + 'Thrown.svg'],
  ["equipment", path + 'Equipment.svg'],
  ["armor", path + 'Armor.svg'],
  ["ammo", path + 'Ammo.svg'],
  ["contract", path + 'Contract.svg'],
  ["pledge", path + 'Pledge.svg'],
  ["devotion", path + 'devotion.svg'],
  ["rite", path + 'Rite.svg'],
  ["miracle", path + 'Miracle.svg'],
  ["discipline_power", path + 'DisciplinePower.svg'],
  ["magic", path + 'Magic.svg'],
  ["werewolf_rite", path + 'Rite-Wolf.svg'],
  ["pack_rite", path + 'Rite-Pack.svg'],
  ["numen", path + 'Numen.svg'],
  ["manifestation", path + 'Manifestation.svg'],
  ["influence", path + 'Influence.svg'],
  ["moonGift", path + 'Gift-Moon.svg'],
  ["shadowGift", path + 'Gift-Shadow.svg'],
  ["wolfGift", path + 'Gift-Wolf.svg'],
  ["vehicle", path + 'Vehicle.svg'],
  ["dreadPower", path + 'DreadPower.svg'],
  ["embed", path + 'Embed.svg'],
  ["interlock", path + 'Interlock.svg'],
  ["exploit", path + 'Exploit.svg'],
  ["cover", path + 'Cover.svg'],
  ["glitch", path + 'Glitch.svg'],
  ["pact", path + 'Pact.svg'],
  ["formAbility", path + 'Manifestation.svg'],
  ["coil", path + 'Coil.svg'],
  ["scale", path + 'Scale.svg'],
  ["form", 'systems/mta/icons/forms/Gauru.svg'],
  ["tactic", path + 'Tactic.svg'],
  ["advanced_armory", path + 'advanced_armory.svg'],
  ["virtuous_ritual", path + 'virtuous_ritual.svg'],
  ["castigation_rite", path + 'castigation_rite.svg'],
  ["elixir", path + 'elixir.svg'],
  ["perispiritism_ritual", path + 'perispiritism_ritual.svg'],
  ["teleinformatics", path + 'teleinformatics.svg'],
  ["thaumatech_implant", path + 'thaumatech_implant.svg'],
]);

/**
 * The trait maximum for attribute & skill buffs.
 * if the trait has a higher base value on the sheet,
 * that value is used instead.
 * Change it freely.
*/
MTA.traitMaximum = 100; // The absolute trait buff maximum (though it could be infinite in theory...)
MTA.traitMaximumLower = 5; // The maximum used for buffs without the checkbox, only used for attributes&skills, not derived traits

/**
 * The list of supported character types.
 * Any value added to this list will fall back to the Mortal sheet.
 * @type {Array[]}
 */
MTA.characterTypes = ["Mortal", "Sleepwalker", "Mage", "Scelesti", "Proximi", "Vampire", "Changeling", "Werewolf", "Demon", "Hunter", "Princess"];

/**
 * The list of supported ephemeral entity types.
 * Any value added to this list will fall back to the ??? sheet.
 * @type {Array[]}
 */
MTA.ephemeralTypes = ["Angel", "Ghost", "Spirit", "Goetia"];


MTA.scelestiRanks = ["Rabashak", "Nasnas", "Autarch", "Shedu", "Baal", "Aswadim"];



MTA.all_traits = {
  attributes: {
    name: "MTA.Attributes",
    list: [
      "attributes_physical",
      "attributes_social",
      "attributes_mental"
    ]
  },
  skills: {
    name: "MTA.Skills",
    list: [
      "skills_physical",
      "skills_social",
      "skills_mental"
    ]
  },
  traits: {
    name: "MTA.Traits",
    list: [
      "derivedTraits"
    ]
  },
  mage_traits: {
    name: "MTA.Mage_traits",
    list: [
      "mage_traits",
      "arcana_gross",
      "arcana_subtle"
    ]
  },
  vampire_traits: {
    name: "MTA.Vampire_traits",
    list: [
      "vampire_traits",
      "disciplines_common",
      "disciplines_unique",
    ]
  },
  werewolf_traits: {
    name: "MTA.Werewolf_traits",
    list: [
      "werewolf_traits",
      "werewolf_renown"
    ]
  },
  changeling_traits: {
    name: "MTA.Changeling_traits",
    list: [
      "changeling_traits"
    ]
  },
  hunter_traits: {
    name: "MTA.Hunter_traits",
    list: [
      "hunter_traits"
    ]
  },
  princess_traits: {
    name: "MTA.Princess_traits",
    list: [
       "princess_traits",
       "princessInvocations_Common",
       "princessInvocations_Unique"
     ]
  },
  demon_traits: {
    name: "MTA.Demon_traits",
    list: [
      "demon_traits"
    ]
  },
  dream_traits: {
    name: "MTA.Dream_traits",
    list: [
      "attributes_physical_dream",
      "attributes_social_dream",
      "attributes_mental_dream"
    ]
  },
  ephemeral_traits: {
    name: "MTA.Ephemeral_traits",
    list: [
      "eph_physical",
      "eph_social",
      "eph_mental"
    ]
  }
}









/**
 * The set of ephemeral attributes used within the system.
 * I know these attributes are technically not physical, social, and mental,
 * but do you seriously expect me to call these lists eph_power, etc.?
 * While new attributes can freely be added, removal is not advised (as some are used for derived traits).
 * @type {Object}
 */
MTA.eph_physical = {
  "power": "MTA.EphPower"
};
MTA.eph_social = {
  "finesse": "MTA.EphFinesse"
};
MTA.eph_mental = {
  "resistance": "MTA.EphResistance"
};


/**
 * The set of Attributes used within the system.
 * While new attributes can freely be added, removal is not advised (as some are used for derived traits).
 * @type {Object}
 */
MTA.attributes_physical = {
    "strength": "MTA.Strength",
    "dexterity": "MTA.Dexterity",
    "stamina": "MTA.Stamina"
  };
MTA.attributes_social = {
    "presence": "MTA.Presence",
    "manipulation": "MTA.Manipulation",
    "composure": "MTA.Composure"
  };
MTA.attributes_mental = {
    "intelligence": "MTA.Intelligence",
    "wits": "MTA.Wits",
    "resolve": "MTA.Resolve"
  };

/**
 * The set of Skills used within the system.
 * While new skills can freely be added, removal is not advised (as some are used for derived traits).
 * @type {Object}
 */
MTA.skills_physical = {
    "athletics": "MTA.Athletics",
    "brawl": "MTA.Brawl",
    "drive": "MTA.Drive",
    "firearms": "MTA.Firearms",
    "larceny": "MTA.Larceny",
    "stealth": "MTA.Stealth", 
    "survival": "MTA.Survival",
    "weaponry": "MTA.Weaponry"
  };
MTA.skills_social = {
    "animalKen": "MTA.AnimalKen",
    "empathy": "MTA.Empathy",
    "expression": "MTA.Expression",
    "intimidation": "MTA.Intimidation",
    "persuasion": "MTA.Persuasion",
    "socialize": "MTA.Socialize", 
    "streetwise": "MTA.Streetwise",
    "subterfuge": "MTA.Subterfuge"
  };
MTA.skills_mental = {
    "academics": "MTA.Academics",
    "computer": "MTA.Computer",
    "crafts": "MTA.Crafts",
    "investigation": "MTA.Investigation",
    "medicine": "MTA.Medicine",
    "occult": "MTA.Occult", 
    "politics": "MTA.Politics",
    "science": "MTA.Science"
  };

/**
 * The set of Derived Traits used within the system.
 * Do not modify.
 * @type {Object}
 */
MTA.derivedTraits = {
  "size": "MTA.Size",
  "speed": "MTA.Speed",
  "defense": "MTA.Defense",
  "armor": "MTA.Armor",
  "initiativeMod": "MTA.Initiative",
  "ballistic": "MTA.BallisticArmor",
  "perception": "MTA.Perception",
  "health": "MTA.Health"
}


/**
 * The set of Derived Dream Traits used within the system.
 * Do not modify.
 * @type {Object}
 */

MTA.attributes_physical_dream = {
  "power": "MTA.EphPower"
};

MTA.attributes_social_dream = {
  "finesse": "MTA.EphFinesse"
};

MTA.attributes_mental_dream = {
  "resistance": "MTA.EphResistance"
};


/**
 * The list of firearm ammunition.
 * Can freely be modified.
 * @type {Array[]}
 */
MTA.cartridges = ["9mm", ".38 Special", ".44 Magnum", ".45 ACP", "30.06", "5.56mm", "12-gauge", "Arrow", "Bolt", "Fuel Canister"];

/**
 * The list of relationship impressions.
 * Can freely be modified.
 * @type {Array[]}
 */
MTA.impressions = ["Hostile","Average","Good","Excellent","Perfect"];

/**
 * The list of ephemeral ranks.
 * Contains a nickname for every rank for every ephemeral entity type.
 * Knowledge, max_essence, and numina are currently unused.
 * @type {Array[]}
 */
 MTA.ephemeral_ranks = [{rank: 1, Ghost: "Poltergeist", Spirit: "Lesser Spirit", Angel: "Lesser angel", Goetia: "Figment", knowledge: 10, max_essence: 10, numina: "1-3"},
 {rank: 2, Ghost: "Minor ghost", Spirit: "Minor Spirit", Angel: "Angel", Goetia: "Notion", knowledge: 15, max_essence: 15, numina: "3-5"},
 {rank: 3, Ghost: "Average ghost", Spirit: "Average Spirit", Angel: "Archangel", Goetia: "Idea", knowledge: 25, max_essence: 20, numina: "5-7"},
 {rank: 4, Ghost: "Powerful ghost", Spirit: "Powerful Spirit", Angel: "Principality", Goetia: "Trend", knowledge: 35, max_essence: 30, numina: "7-9"},
 {rank: 5, Ghost: "Geist", Spirit: "Minor god", Angel: "Power", Goetia: "Meme", knowledge: 40, max_essence: 50, numina: "9-11"},
 {rank: 6, Ghost: "Geist", Spirit: "Lesser god", Angel: "Virtue", Goetia:"Belief", knowledge: 55, max_essence: 56, numina: "11-13"},
 {rank: 7, Ghost: "Geist", Spirit: "Greater god", Angel: "Dominion", Goetia:"Mentality", knowledge: 60, max_essence: 60, numina: "13-14"},
 {rank: 8, Ghost: "Geist", Spirit: "Lesser Celestine", Angel: "Throne", Goetia:"Ethos", knowledge: 70, max_essence: 70, numina: "14-16"},
 {rank: 9, Ghost: "Geist", Spirit: "Greater Celestine", Angel: "Cherubim", Goetia:"Psyche", knowledge: 80, max_essence: 80, numina: "16-20"},
 {rank: 10, Ghost: "Geist", Spirit: "Beyond manifest", Angel: "Seraphim", Goetia:"Noosphere", knowledge: 100, max_essence: 100, numina: "20+"}
];

/**
 * A list of item types that only ephemeral entities use, to make sure that other characters can't use them.
 */
MTA.ephemeralItemTypes = [
  "numen", "manifestation", "influence"
]

/**
 * A list of item types that only normal characters use, to make sure that other characters can't use them.
 */
MTA.characterItemTypes = [
  "spell", "merit", "activeSpell", "yantra", "attainment", "relationship", "devotion", "rite", "vinculum", "discipline_power", "contract", "pledge", "form", "facet", "werewolf_rite", "dreadPower", "embed", "interlock", "exploit", "cover", "glitch", "pact", "formAbility", "coil", "scale", "charm", "regalia"
]

/**
 * The set of colours used as the border around portraits in the 
 * actor directory, when the user is the GM, or the character type
 * is set to visible on the character sheet.
 * @type {Object}
 */
MTA.typeColors = {
  unknown: "DimGray", 
  Mortal: "White", 
  Sleepwalker: "CadetBlue", 
  Proximi: "Aquamarine", 
  Mage: "Aqua", 
  Scelesti: "Purple",
  Ghost: "BurlyWood", 
  Spirit: "MediumPurple", 
  Angel: "Gold", 
  Demon: "Orangered", 
  Vampire: "Crimson", 
  Changeling: "DarkGreen", 
  Werewolf: "saddlebrown",
  Hunter: "slategray "
};


MTA.magicItemColors = {
  Default: 'MediumPurple',
  Awakened: 'Aqua',
  Gadget: 'Gold',
  Imbued: 'Aqua',
  Enhanced: 'Coral',
  Artifact: 'darkorange',
  Embedded: 'Gold',
  Exploited: 'Orangered'
}





/**
 * The list of supported melee weapon types.
 * Values added here will fall back to using Strength + Weaponry as
 * the associated dice pool for rolling.
 * @type {Array[]}
 */
MTA.meleeTypes = ["Melee", "Unarmed", "Thrown"];


/**
 * List of merits with special functions in order to display tooltips.
 * Don't modify.
 */
MTA.SPECIAL_MERITS = [
  {name: "Defensive Combat (Brawl)", tooltip: "Uses Brawl to calculate Defense"},
  {name: "Defensive Combat (Weaponry)", tooltip: "Uses Weaponry to calculate Defense (only if a weapon is equipped)"},
  {name: "Iron Stamina", tooltip: "Reduces wound penalty by rating"}
];


/* -------------------------------------------- */
/*          Mage the Awakening                  */
/* -------------------------------------------- */

/**
 * The set of gross and subtle Arcana used within the system.
 * Can freely be modified.
 * @type {Object}
 */
MTA.arcana_gross = {
  "forces": "MTA.ArcanumForces",
  "life": "MTA.ArcanumLife",
  "matter": "MTA.ArcanumMatter",
  "space": "MTA.ArcanumSpace",
  "time": "MTA.ArcanumTime"
};

MTA.arcana_subtle = {
  "death": "MTA.ArcanumDeath",
  "fate": "MTA.ArcanumFate",
  "mind": "MTA.ArcanumMind",
  "prime": "MTA.ArcanumPrime",
  "spirit": "MTA.ArcanumSpirit"
};

// A combination of gross and subtle Arcana, to be sorted separately.
MTA.arcana = Object.assign({}, MTA.arcana_gross, MTA.arcana_subtle);

/**
 * The set of rollable Mage traits used within the system.
 * Do not modify.
 * @type {Object}
 */
 MTA.mage_traits = {
  "gnosis": "MTA.MageGnosis",
  "wisdom": "MTA.MageWisdom"
}


MTA.practices = ["Compelling", "Knowing", "Unveiling", "Ruling", "Shielding", "Veiling", "Fraying", "Perfecting", "Weaving", "Patterning", "Unraveling", "Making", "Unmaking"];
MTA.primaryFactors = ["Potency", "Duration"];
MTA.spell_casting = {
  potency: {
    standard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    advanced: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  },
  duration: {
    standard: ["1 turn", "2 turns", "3 turns", "5 turns", "10 turns", "20 turns", "30 turns", "40 turns", "50 turns", "60 turns", "70 turns"],
    advanced: ["1 scene/hour", "1 day", "1 week", "1 month", "1 year", "Indefinite"]
  },
  scale: {
    standard: ["1 Subject, Size 5, Arm's reach", "2 Subjects, Size 6, Small room", "4 Subjects, Size 7, Large room", "8 Subjects, Size 8, Single floor", "16 Subjects, Size 9, Small house"],
    advanced: ["5 Subjects, Size 5, Large house", "10 Subjects, Size 10, Small warehouse", "20 Subjects, Size 15, Supermarket", "40 Subjects, Size 20, Shopping mall", "80 Subjects, Size 25, City block", "160 Subjects, Size 30, Small neighborhood", "320 Subjects, Size 35, Small neighborhood", "640 Subjects, Size 40, Small neighborhood", "1280 Subjects, Size 45, Small neighborhood"]
  },
  casting_time: {
    standard: ["3 hours", "1 hour", "30 minutes", "10 minutes", "1 minute"],
    advanced: ["1 turn"]
  },
  range: {
    standard: ["Self/touch or Aimed"],
    advanced: ["Sensory", "Remote View"]
  },
  sleeper_witnesses: ["None", "One", "A few", "Large group", "Full crowd"],
  condition: ["No condition", "Improbable condition", "Infrequent condition", "Common condition"]
};
MTA.gnosis_levels = [
    {mana_per_turn: 1, max_mana: 10},
    {mana_per_turn: 2, max_mana: 11},
    {mana_per_turn: 3, max_mana: 12},
    {mana_per_turn: 4, max_mana: 13},
    {mana_per_turn: 5, max_mana: 15},
    {mana_per_turn: 6, max_mana: 20},
    {mana_per_turn: 7, max_mana: 25},
    {mana_per_turn: 8, max_mana: 30},
    {mana_per_turn: 10, max_mana: 50},
    {mana_per_turn: 15, max_mana: 75}
  ];

/* -------------------------------------------- */
/*          Vampire the Requiem                 */
/* -------------------------------------------- */

MTA.bloodPotency_levels = [
    {vitae_per_turn: 1, max_vitae: undefined},
    {vitae_per_turn: 1, max_vitae: 10},
    {vitae_per_turn: 2, max_vitae: 11},
    {vitae_per_turn: 3, max_vitae: 12},
    {vitae_per_turn: 4, max_vitae: 13},
    {vitae_per_turn: 5, max_vitae: 15},
    {vitae_per_turn: 6, max_vitae: 20},
    {vitae_per_turn: 7, max_vitae: 25},
    {vitae_per_turn: 8, max_vitae: 30},
    {vitae_per_turn: 10, max_vitae: 50},
    {vitae_per_turn: 15, max_vitae: 75}
  ];
MTA.actionTypes = ["Instant", "Reflexive", "Contested vs", "Contested (refl. resist.) vs", "Extended"];
MTA.rite_types = ["Rite", "Miracle"];
MTA.rite_withstandTypes = ["Resisted by", "Contested by"];


/**
 * The set of Vampire disciplines.
 * The separation into common and unique is purely for display purposes (and not even correct).
 * Can freely be modified.
 * @type {Object}
 */
MTA.disciplines_common = {
  "celerity": "MTA.DisciplineCelerity", // Adds to defense
  "resilience": "MTA.DisciplineResilience",
  "vigor": "MTA.DisciplineVigor",
  "animalism": "MTA.DisciplineAnimalism",
  "obfuscate": "MTA.DisciplineObfuscate",
  "cruac": "MTA.DisciplineCruac"
};

MTA.disciplines_unique = {
  "auspex": "MTA.DisciplineAuspex",
  "dominate": "MTA.DisciplineDominate",
  "majesty": "MTA.DisciplineMajesty",
  "nightmare": "MTA.DisciplineNightmare",
  "protean": "MTA.DisciplineProtean",
  "thebanSorcery": "MTA.DisciplineThebanSorcery"
};

/**
 * The set of rollable Vampire traits used within the system.
 * Do not modify.
 * @type {Object}
 */
 MTA.vampire_traits = {
  "bloodPotency": "MTA.BloodPotency",
  "humanity": "MTA.Humanity"
}


/* -------------------------------------------- */
/*          Changeling the Lost                 */
/* -------------------------------------------- */

/**
 * The set of rollable Changeling traits used within the system.
 * Do not modify.
 * @type {Object}
 */
 MTA.changeling_traits = {
  "wyrd": "MTA.ChangelingWyrd",
  "mantle": "MTA.ChangelingMantle"
}



MTA.glamour_levels = [
    {glamour_per_turn: 1, max_glamour: 10},
    {glamour_per_turn: 2, max_glamour: 11},
    {glamour_per_turn: 3, max_glamour: 12},
    {glamour_per_turn: 4, max_glamour: 13},
    {glamour_per_turn: 5, max_glamour: 15},
    {glamour_per_turn: 6, max_glamour: 20},
    {glamour_per_turn: 7, max_glamour: 25},
    {glamour_per_turn: 8, max_glamour: 30},
    {glamour_per_turn: 10, max_glamour: 50},
    {glamour_per_turn: 15, max_glamour: 75}
  ];
  
MTA.contract_majorTypes = ["Arcadian", "Court", "Goblin"];
MTA.contract_ArcadianTypes = ["Crown", "Jewels", "Mirror", "Shield", "Steed", "Sword"];
MTA.contract_CourtTypes = ["Spring", "Summer", "Autumn", "Winter"];
MTA.contract_regalia = ["Common", "Royal"];
MTA.pledge_types = ["Sealing", "Oath", "Bargain"];

/* -------------------------------------------- */
/*          Werewolf the Requiem                */
/* -------------------------------------------- */

MTA.giftTypes = {
  moon: "MTA.Moon", 
  shadow: "MTA.Shadow", 
  wolf: "MTA.Wolf"
};

/**
 * The set of Werewolf Renown used within the system.
 * Can freely be modified.
 * @type {Object}
 */
MTA.werewolf_renown = {
  "purity": "MTA.WerewolfPurity",
  "glory": "MTA.WerewolfGlory",
  "honor": "MTA.WerewolfHonor",
  "wisdom": "MTA.WerewolfWisdom",
  "cunning": "MTA.WerewolfCunning"
}

/**
 * The set of rollable Werewolf traits used within the system.
 * Do not modify.
 * @type {Object}
 */
MTA.werewolf_traits = {
  "primalUrge": "MTA.WerewolfPrimalUrge",
  "harmony": "MTA.WerewolfHarmony"
}

MTA.primalUrge_levels = [
  {essence_per_turn: 1, max_essence: 10},
  {essence_per_turn: 2, max_essence: 11},
  {essence_per_turn: 3, max_essence: 12},
  {essence_per_turn: 4, max_essence: 13},
  {essence_per_turn: 5, max_essence: 15},
  {essence_per_turn: 6, max_essence: 20},
  {essence_per_turn: 7, max_essence: 25},
  {essence_per_turn: 8, max_essence: 30},
  {essence_per_turn: 10, max_essence: 50},
  {essence_per_turn: 15, max_essence: 75}
];

/* -------------------------------------------- */
/*          Demon the Descent                   */
/* -------------------------------------------- */

/**
 * The set of rollable Demon traits used within the system.
 * Do not modify.
 * @type {Object}
 */
MTA.demon_traits = {
  "primum": "MTA.Primum"
};

MTA.primum_levels = [
  {aether_per_turn: 1, max_aether: 10},
  {aether_per_turn: 2, max_aether: 11},
  {aether_per_turn: 3, max_aether: 12},
  {aether_per_turn: 4, max_aether: 13},
  {aether_per_turn: 5, max_aether: 14},
  {aether_per_turn: 6, max_aether: 15},
  {aether_per_turn: 7, max_aether: 20},
  {aether_per_turn: 8, max_aether: 30},
  {aether_per_turn: 10, max_aether: 50},
  {aether_per_turn: 15, max_aether: 100}
];

/* -------------------------------------------- */
/*          Hunter      TODO:              */
/* -------------------------------------------- */

MTA.hunter_traits = {
  "elixir": "MTA.Elixir",
  "advanced_armory": "MTA.AdvancedArmory",
  "benediction": "MTA.Benediction"
};
/*----------------------------------------------*/
/*         Princess The Hopeful                 */
/*----------------------------------------------*/

MTA.princess_traits = {
  "innerLight": "MTA.InnerLight"
};
MTA.inner_light_levels = [
  {wisps_per_turn:1, max_wisps:10},
  {wisps_per_turn:2, max_wisps:11},
  {wisps_per_turn:3, max_wisps:12},
  {wisps_per_turn:4, max_wisps:13},
  {wisps_per_turn:5, max_wisps:15},
  {wisps_per_turn:6, max_wisps:20},
  {wisps_per_turn:7, max_wisps:25},
  {wisps_per_turn:8, max_wisps:30},
  {wisps_per_turn:10, max_wisps:50},
  {wisps_per_turn:15, max_wisps:75},
];

/**
 * The set of Pincess Invocations used within the system.
 * Can freely be modified.
 * @type {Object}
 */
MTA.princessInvocations_Common = {
  "acqua": "MTA.PrincessAcqua",
  "aria": "MTA.PrincessAria",
  "fuoco": "MTA.PrincessFuoco",
  "legno": "MTA.PrincessLegno",
  "terra": "MTA.PrincessTerra",
  "lacrima": "MTA.PrincessLacrima",
  "tempesta": "MTA.PrincessTempesta",
  "specchio": "MTA.PrincessSpecchio"
}

MTA.princessInvocations_Unique = {
  "fulmine": "MTA.PrincessFulmine",
  "mettallo": "MTA.PrincessMettallo",
  "vuoto": "MTA.PrincessVuoto",
  "capriccio": "MTA.PrincessCapriccio",
  "arrissire": "MTA.PrincessArrissire"
}

MTA.charmTypes = {
  appear : "MTA.Appear",
  bless : "MTA.Bless",
  connect : "MTA.Connect",
  fight : "MTA.Fight",
  govern : "MTA.Govern",
  inspire : "MTA.Inspire",
  learn : "MTA.Learn",
  perfect : "MTA.Perfect",
  restore : "MTA.Restore",
  shape : "MTA.Shape",
};