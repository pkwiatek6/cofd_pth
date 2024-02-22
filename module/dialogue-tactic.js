export class TacticDialogue extends Application {
    constructor(actor, item,...args) {
        super(...args);
        this.actor = actor;
        this.item = item;
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["worldbuilding", "dialogue", "mta-sheet"],
            template: "systems/mta/templates/dialogues/dialogue-tactic.html",
            width: 400,
        });
    }


    getData() {
        const data = super.getData();
        let dicepools = this.item.system.dicepools_primary ?? []; 
        data.dicepools_primary = dicepools.filter(dp => dp.primary);
        data.dicepools_secondary = dicepools.filter(dp => !dp.primary);

        return data;
    }

    activateListeners(html) {
        //super.activateListeners(html);
    
        // Select Ammo
        html.find('.rollIcon').click(ev => this._onRoll(ev));
    
      }

      async _onRoll(ev) {
        const data = this.getData();
        const index = +ev.currentTarget.dataset.index;
        const primary = !!ev.currentTarget.dataset.primary;

        const dicePool = primary ? data.dicepools_primary[index] : data.dicepools_secondary[index];

        await this.item.roll();
        if(!dicePool.noDice) {
            this.actor.roll(dicePool.attributes, dicePool.value, dicePool.description);
        }
        else {
            return ChatMessage.create({
                user: game.user.id,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                content: "",
                speaker: ChatMessage.getSpeaker({actor: this.actor, token: this.actor.token}),
                flavor: dicePool.description
            });
        }
      }

}