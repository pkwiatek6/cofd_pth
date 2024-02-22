import { createShortActionMessage } from "./chat.js";

export class ReloadDialogue extends Application {
  constructor(item, button, container, ...args) {
    super(...args);
    this._item = item;
    this._button = button;
    this.container = container;
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["worldbuilding", "dialogue"],
  	  template: "systems/mta/templates/dialogues/dialogue-reload.html",
      width: 200,
      height: 400
    });
  }
  
  getData() {
    const data = super.getData();
    
    let owner = this._item.actor;
    if(owner == null){
      console.log("Error: no actor found.");
      return data;
    }
    const ammo_type = this._item.system.cartridge;
    data.ammoList = owner.items.filter(element => (element.type === "ammo") && (element.system.cartridge === ammo_type) && (element.system.quantity > 0));
    return data;
  }
  
  activateListeners(html) {
    super.activateListeners(html);

    // Select Ammo
    html.find('.selectAmmo').click(ev => this._onSelectAmmo(ev));

  }
  
  /**
   * Handle selecting of a magazine and consequent loading of the firearm
   * @private
   */
  async _onSelectAmmo(ev){  
    if(!this._button.classList.contains("reloaded")) this._button.classList.add("reloaded");

    const itemId = ev.currentTarget.closest(".selectAmmo").dataset.itemId;
    const ammo = this._item.actor.items.get(itemId);
    const owner = this._item.actor;
    
    createShortActionMessage("Reloads", owner);

    //Calculate the ammo amount that is reloaded and substract it from the inventory item 
    const newAmmo = ammo.toObject();
    const magazineSize = this._item.system.capacity;
    const ammoAmount = ammo.system.quantity;
    let transferAmount = ammoAmount - magazineSize;

    let updateData = [];

    if(transferAmount <= 0){ // The magazine is emptied, only filling the gun with what's left
      transferAmount = ammoAmount;
      await owner.deleteEmbeddedDocuments("Item", [ammo.id]);  //Deleting old ammo
    } 
    else{ // The gun is filled, and the magazine in the inventory is updated
      transferAmount = magazineSize;
      const newAmount = ammoAmount - transferAmount;
      updateData.push({_id: ammo.id,"system.quantity": newAmount});
    } 
    newAmmo.system.quantity = transferAmount;
    updateData.push({_id: this._item.id, "system.magazine": newAmmo});
    await owner.updateEmbeddedDocuments("Item", updateData);

    //if(this.container) this.container.render();
    this.close();
  }
}