/*global game, gs, Phaser, console, util*/
/*global Item*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CREATE_RELIGION_TYPES:
// ************************************************************************************************
gs.createReligionTypes = function () {
	this.religionTypes = {};
	
	// TROG:
	// Player will always crit when less then half hp
	this.religionTypes.Trog = {};
	this.religionTypes.Trog.desc = "当你的生命值低于三分之一时会陷入狂暴，每次攻击必定造成暴击。";
	this.religionTypes.Trog.effect = function (character) {
		if (character.currentHp <= character.maxHp / 3) {
			character.alwaysCrit += 1;
		}
	};
	
	// Wealth:
	// Player gains tons of gold when joining:
	this.religionTypes.Wealth = {};
	this.religionTypes.Wealth.desc = "你将立刻获得一大批金币。";
	this.religionTypes.Wealth.onSet = function (character) {
		gs.getIndexInBox(character.tileIndex.x - 1, character.tileIndex.y - 1, character.tileIndex.x + 2, character.tileIndex.y + 2).forEach(function (index) {
			if ((gs.isPassable(index) || gs.getChar(index)) && !gs.getItem(index)) {
				gs.createFloorItem(index, Item.createItem('GoldCoin', {amount: util.randInt(10, 20)}));
			}
		});
	};
	
	// ARCHER:
	// Player is occasionally gifted with projectiles
	this.religionTypes.TheArcher = {};
	this.religionTypes.TheArcher.desc = "游侠之神偶尔会赐予你一批飞弹。";
	this.religionTypes.TheArcher.onTurn = function (character) {
		var itemType;
		
		// Approx every 500 turns
		if (game.rnd.frac() < (1 / 500)) {
			itemType = util.randElem([gs.itemTypes.Dart, gs.itemTypes.Javelin]);
			gs.pc.inventory.addItem(Item.createItem(itemType.name, {mod: gs.dropItemModifier(itemType)}));
		}
	};
	
	// WIZARD:
	// Gives the player a chance to save mana on casting
	this.religionTypes.TheWizard = {};
	this.religionTypes.TheWizard.desc = "你的能力偶尔不消耗法力值。";
	this.religionTypes.TheWizard.effect = function (character) {
		character.bonusSaveManaChance += 0.05;	
	};
	
	// HEALTH:
	// Player is occasionaly healed
	this.religionTypes.Health = {};
	this.religionTypes.Health.desc = "当你的生命值低于 50% 时，偶尔会自动恢复。";
	this.religionTypes.Health.onTurn = function (character) {
		// Every 200 turns
		if (gs.pc.currentHp < gs.pc.maxHp / 2 && game.rnd.frac() < (1 / 200)) {
			gs.pc.healHp(Math.ceil(gs.pc.maxHp / 2));
			gs.createParticlePoof(gs.pc.tileIndex, 'GREEN');
		}
	};
	
	// EXPLORATION:
	// Players health and mana is restored whenever a new level is generated
	this.religionTypes.Exploration = {};
	this.religionTypes.Exploration.desc = "若你在下降到尚未探索的新层时生命值低于 50%，将被完全治愈。";
	
	this.nameTypes(this.religionTypes);
};

// CREATE_ALTER:
// ************************************************************************************************
gs.createAltar = function (tileIndex, typeName) {
	var indexList;
	this.createObject(tileIndex, typeName);
	
	indexList = gs.getIndexInBox(tileIndex.x - 1, tileIndex.y - 1, tileIndex.x + 2, tileIndex.y + 2);
	indexList = indexList.filter(index => game.rnd.frac() < 0.4);
	if (typeName === 'AltarOfTrog') {
		/*
		indexList = indexList.filter(index => gs.isValidSpawnIndex(index));
		if (gs.debugProperties.spawnMobs) {
			indexList.forEach(function (index) {
				gs.createNPC(index, 'GoblinBrute');
			}, this);
		}
		*/
	} 
	else if (typeName === 'AltarOfHealth') {
		/*
		indexList = indexList.filter(index => !gs.getItem(index) && gs.isPassable(index));
		indexList.forEach(function (index) {
			gs.createFloorItem(index, Item.createItem('PotionOfHealing'));
		}, this);
		*/
	} 
	else if (typeName === 'AltarOfTheWizard') {
		/*
		indexList = indexList.filter(index => !gs.getItem(index) && gs.isPassable(index));
		indexList.forEach(function (index) {
			gs.createFloorItem(index, Item.createItem('PotionOfEnergy'));
		}, this);
		*/
	} 
	else if (typeName === 'AltarOfWealth') {
		/*
		indexList = indexList.filter(index => !gs.getItem(index) && gs.isPassable(index));
		indexList.forEach(function (index) {
			gs.createFloorItem(index, Item.createItem('GoldCoin', {amount: gs.dropGoldAmount()}));
		}, this);
		*/
	} 
	else if (typeName === 'AltarOfTheArcher') {
		/*
		indexList = indexList.filter(index => !gs.getItem(index) && gs.isPassable(index));
		indexList.forEach(function (index) {
			gs.createFloorItem(index, Item.createItem('Javelin'));
		}, this);
		*/
	}
};