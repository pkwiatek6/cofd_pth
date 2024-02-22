

export class TokenHotBar extends Application {
    constructor(options) {
        super(options);
      }

    /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["worldbuilding", "dialogue", "mta-sheet"],
            template: "systems/mta/templates/other/tokenHotBar.html",
            popOut: false,
            minimisable: false,
            resisable: false
      });
    }

    getData() {
        const data = super.getData();
        if(this.tokens){
            this.macros = [];

            data.showNonWielded = game.user.flags?.mta?.tokenHotBar?.showNonWielded;
            data.showEquipment = game.user.flags?.mta?.tokenHotBar?.showEquipment;

            // Prepare generic macros
            this.macros.push({
                name: "Perception",
                img: "systems/mta/icons/gui/perception.svg",
                sheetMacro: true,
                callback: () => {
                    this.tokens.forEach(token => {
                        if(token.actor) token.actor.rollPerception(true, true, token.actor);
                    })
                 }
            });

            // Create name for macro bar
            if(this.tokens.length > 1){
                let names = this.tokens.map(token => token.name);
                data.characterName = names.join(", ");
            }
            let typeOrder = new Map ([
                ["firearm", 0], 
                ["melee", 1]
            ])
            if(data.showEquipment){
                typeOrder.set("armor", 2);
                typeOrder.set("ammo", 3);
                typeOrder.set("equipment", 4);
                typeOrder.set("container", 5);
            }

            // Only show item macros if only 1 token was selected
            if(this.tokens.length === 1){
                let token = this.tokens[0];
    
                data.characterName = token.name;
                if(token.actor){
                    if(token.actor.system.characterType === "Mage" || token.actor.system.characterType === "Proximi"){
                        this.macros.push({
                            name: "Improvised Spellcasting",
                            img: "systems/mta/icons/gui/macro-improvisedSpell.svg",
                            sheetMacro: true,
                            callback: () => {
                                token.actor.castSpell();
                            }
                        });
                    }

                    // Add equipped items and favourited abilities
                    let equipped = token.actor.items.filter(item => (typeOrder.has(item.type) && (data.showNonWielded || item.system.equipped)) || item.system.isFavorite || (item.type === "formAbility" && item.system.effectsActive))
                    equipped.forEach(item => {
                        let itemEntity = token.actor.items.get(item.id);
                        this.macros.push({
                            name: item.name,
                            description: item.system.description,
                            img: item.img,
                            type: item.type,
                            notEquipped: typeOrder.has(item.type) && !item.system.equipped,
                            isFavorite: item.system.isFavorite,
                            callback: () => {
                                if (item.type === "spell") return token.actor.castSpell(itemEntity);
                                return itemEntity.roll();
                            }
                        })
                    });
                }
            }
            
            // Sort the macros. Sheet macros > favorited abilities > equipped items (sorted by typeOrder), then alphabetically (except sheet macros)
            this.macros.sort((a,b) => (typeOrder.has(a.type) ? typeOrder.get(a.type) : (a.sheetMacro ? -2 : -1)) - (typeOrder.has(b.type) ? typeOrder.get(b.type) : (b.sheetMacro ? -2 : -1)) || ((a.sheetMacro && b.sheetMacro) ? 0 : a.name.localeCompare(b.name) ));

            data.macros = this.macros;
        }
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('.macro').click(ev => {
            let index = ev.currentTarget.closest(".macro").dataset.index;
            if(this.macros) this.macros[index].callback();
        });
        html.find('.showNonWielded').click(async ev => {
            let toggle = !game.user.flags?.mta?.tokenHotBar?.showNonWielded;
            let updateData = {
                'flags': {
                    'mta': {
                        tokenHotBar: {showNonWielded: toggle}
                    }
                 }
            };
            await game.user.update(updateData);
            this.render(true);
        });
        html.find('.showEquipment').click(async ev => {
            let toggle = !game.user.flags?.mta?.tokenHotBar?.showEquipment;
            let updateData = {
                'flags': {
                    'mta': {
                        tokenHotBar: {showEquipment: toggle}
                    }
                 }
            };
            await game.user.update(updateData);
            this.render(true);
        });
        html.find('.settings').click(ev => {
            let l = $('.settings-menu')
            $('.settings-menu').toggle();
        });

        html.find('.damage-increase .fa-minus').click(ev => {
            let damageAmount = $('.damage-number').val();
            damageAmount--;
            if(damageAmount === 0) damageAmount = -1;
            $('.damage-number').val(damageAmount);
            if(damageAmount < 0) {
                $('.damage-apply').addClass('green');
                $('.damage-apply').removeClass('red');
                $('.damage-apply').html('Heal');
            }
            else {
                $('.damage-apply').removeClass('green');
                $('.damage-apply').addClass('red');
                $('.damage-apply').html('Damage');
            }
        });

        html.find('.damage-increase .fa-plus').click(ev => {
            let damageAmount = $('.damage-number').val();
            damageAmount++;
            if(damageAmount === 0) damageAmount = 1;
            $('.damage-number').val(damageAmount);
            if(damageAmount < 0) {
                $('.damage-apply').addClass('green');
                $('.damage-apply').removeClass('red');
                $('.damage-apply').html('Heal');
            }
            else {
                $('.damage-apply').removeClass('green');
                $('.damage-apply').addClass('red');
                $('.damage-apply').html('Damage');
            }
        });

        html.find('.damage-number').change(ev => {
            let damageAmount = $('.damage-number').val();
            if(damageAmount < 0) {
                $('.damage-apply').addClass('green');
                $('.damage-apply').removeClass('red');
                $('.damage-apply').html('Heal');
            }
            else {
                $('.damage-apply').removeClass('green');
                $('.damage-apply').addClass('red');
                $('.damage-apply').html('Damage');
            }
        });

        html.find('.damage-type .fa-chevron-left').click(ev => {
            let damagetype = $('.damage-type').data('type');
            if(damagetype === "bashing") damagetype = "aggravated";
            else if(damagetype === "lethal") damagetype = "bashing";
            else if(damagetype === "aggravated") damagetype = "lethal";
            $('.damage-type').data('type', damagetype);
            $('.damage-type .button-content').html(damagetype);
        });

        html.find('.damage-type .fa-chevron-right').click(ev => {
            let damagetype = $('.damage-type').data('type');
            if(damagetype === "bashing") damagetype = "lethal";
            else if(damagetype === "lethal") damagetype = "aggravated";
            else if(damagetype === "aggravated") damagetype = "bashing";
            $('.damage-type').data('type', damagetype);
            $('.damage-type .button-content').html(damagetype);
        });

        html.find('.damage-apply').click(ev => {
            let damageAmount = $('.damage-number').val();
            let damagetype = $('.damage-type').data('type');

            this.tokens.forEach(token => {
                let actor = token.actor;
                if(actor) {
                    actor.damage(+damageAmount, damagetype)
                }
            });
        });
      }

      static tokenHotbarInit() {
        return new TokenHotBar();
      }

}




