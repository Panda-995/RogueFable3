/*global game, gs, Phaser, console, localStorage*/
/*global LARGE_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';


// OPEN_OPTIONS_MENU:
// *****************************************************************************
gs.openOptionsMenu = function () {
	if (gs.state === 'GAME_STATE') {
		gs.optionsMenu.open();
	} else if (gs.state === 'OPTIONS_MENU_STATE') {
		gs.optionsMenu.close();
	}
};
	
// OPEN_DEATH_MENU:
// *****************************************************************************
gs.openDeathMenu = function () {
	var dialog,
		respawnClicked,
		mainMenuClicked,
		deathText,
		charClicked;
	
	deathText = '你的' + gs.pc.level + '级' + translator.getText(gs.pc.characterClass) + '在' + translator.getText(gs.zoneName) + gs.deathText + '。';
	
	respawnClicked = function () {
		gs.pc.healHp(1000);
		gs.pc.poisonDamage = 0;
		gs.pc.isAlive = true;
	};
	
	mainMenuClicked = function () {
		gs.dialogMenu.close();
		gs.destroyLevel();
		gs.startMainMenu();
	};
	
	charClicked = function () {
		gs.characterMenu.open();
	};
	
	// Setup Dialog:
	dialog = [{}];
	dialog[0].text = deathText;
	dialog[0].responses = [
		{text: 'Instant Respawn (Testing)', nextLine: 'exit', prereq: function () {return gs.debugProperties.allowRespawn; }, func: respawnClicked},
		{text: '查看角色', nextLine: 'exit', func: charClicked},
		{text: '主菜单', nextLine: 'exit', func: mainMenuClicked}
	];
	
	
	this.dialogMenu.open(dialog);
};

// LIFE_SAVING_MENU:
// *****************************************************************************
gs.openLifeSavingMenu = function () {
	var dialog;
	
	gs.pc.inventory.removeItem(gs.pc.inventory.itemOfType(gs.itemTypes.RingOfLifeSaving));
		
	gs.pc.isAlive = true;
	gs.pc.healHp(gs.pc.maxHp);
	gs.pc.gainMp(gs.pc.maxMp);
		
	// Force players turn:
	gs.pc.waitTime = 0;
	gs.activeCharacterIndex = 0;
	gs.activeCharacter = gs.pc;
	
	// Setup Dialog:
	dialog = [{}];
	dialog[0].text = '你被杀了。你的生命之环闪烁着明亮的光芒，让你复活。';
	dialog[0].responses = [
		{text: '好的', nextLine: 'exit'}
	];
	
	this.dialogMenu.open(dialog);
};

// OPEN_ALTER_MENU:
// *****************************************************************************
gs.openAltarMenu = function () {
	var okClicked, dialog, religionName;
	
	religionName = gs.currentAltar.type.religion;
	
	okClicked = function () {
		gs.pc.setReligion(religionName);
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
	
	dialog = [{}];
	
	if (gs.pc.religion) {
		dialog[0].text = '你在' + translator.getText(gs.capitalSplit(religionName)) + '的祭坛前祈祷，但你已经信仰其它神明了！';
		dialog[0].responses = [{text: '好的', nextLine: 'exit'}];
	}
	else {
		dialog[0].text = '你在' + translator.getText(gs.capitalSplit(religionName)) + '的祭坛前祈祷。\n' + gs.religionTypes[religionName].desc + '\n\n你要皈依这个信仰吗？';
		dialog[0].responses = [{text: '是', nextLine: 'exit', func: okClicked},
							   {text: '否', nextLine: 'exit'}
							  ];
	}
	
	
	this.dialogMenu.open(dialog);
};



// OPEN_VICTORY_MENU:
// *****************************************************************************
gs.openVictoryMenu = function () {
	var dialog = [{}],
		okClicked,
		time,
		mins;
	
	time = gs.gameTime();
	
	if (gs.achievements[gs.pc.characterClass] === 0 || time < gs.achievements[gs.pc.characterClass]) {
		gs.achievements[gs.pc.characterClass] = time;
	}
	
	
	gs.clearGameData();
	

	//gs.postStats('successfully retrieved the Goblet of Yendor');
	this.logGameRecord('successfully retrieved the Goblet of Yendor', true);
	
	okClicked = function () {
		gs.stopAllMusic();
		localStorage.setItem('Achievements', JSON.stringify(gs.achievements));
		
		gs.dialogMenu.close();
		gs.destroyLevel();
		gs.startMainMenu();
	};

	dialog[0].text = '你的 ' + gs.pc.level + ' 级' + translator.getText(gs.pc.characterClass) + '，在' + this.timeToString(time) + '内成功取得了延多之杯。';
	dialog[0].responses = [{text: '[结束]', nextLine: 'exit', func: okClicked}
						  ];
	gs.createEXPEffect(gs.pc.tileIndex);
	this.dialogMenu.open(dialog);
};

// OPEN_INSTRUCTION_MENU:
// *****************************************************************************
gs.openInstructionMenu = function () {
	var dialog = [{}];
	

	
	dialog[0].text = "欢迎来到卡尔哈卡斯山脉。知识学会委派你前来探索这片荒芜的群峰，并寻回传说中的智慧宝库 —— 知识法典。\n学会的学者们相信，法典就藏在这以东某座废弃宝库之中。\n祝你好运，平安归来！";
	dialog[0].responses = [{text: '战士', nextLine: 'exit', func: gs.pc.setClass.bind(gs.pc, 'Warrior')},
						   {text: '游侠', nextLine: 'exit', func: gs.pc.setClass.bind(gs.pc, 'Ranger')},
						   {text: '盗贼', nextLine: 'exit', func: gs.pc.setClass.bind(gs.pc, 'Rogue')},
						   {text: '灵能者', nextLine: 'exit', func: gs.pc.setClass.bind(gs.pc, 'Psyker')}
						  ];
	
	this.dialogMenu.open(dialog);
};


// OPEN_ATTRIBUTE_GAIN_MENU:
// *****************************************************************************
gs.openAttributeGainMenu = function () {
	var dialog = [{}], strFunc, dexFunc, intFunc;
	
	strFunc = function () {
		gs.pc.baseStrength += 1;
		gs.pc.popUpText('+1 Str', '#ffffff');
		gs.pc.updateStats();
		gs.pc.currentHp += 2;
		
		gs.usingFountain = null;
	};
	
	dexFunc = function () {
		gs.pc.baseDexterity += 1;
		gs.pc.popUpText('+1 Dex', '#ffffff');
		gs.pc.updateStats();
		
		gs.usingFountain = null;
	};
	
	intFunc = function () {
		gs.pc.baseIntelligence += 1;
		gs.pc.popUpText('+1 Int', '#ffffff');
		gs.pc.updateStats();
		gs.pc.currentEp += 1;
		
		gs.usingFountain = null;
	};
	

	dialog[0].text = '选择要增加的属性。';
	dialog[0].responses = [
		// Strength:
		{
			text: function () {
				return '力量: ' + gs.pc.strength + ' -> ' + (gs.pc.strength + 1); 
			}, 
			nextLine: 'exit', 
			func: strFunc,
			desc: '力量:\n增加你的近战力量和最大生命值。'
		},
		
		// Dexterity:
		{
			text: function () {
				return '敏捷: ' + gs.pc.dexterity + ' -> ' + (gs.pc.dexterity + 1);
			},
			nextLine: 'exit',
			func: dexFunc,
			desc: '敏捷:\n增加你的射程、潜行和闪避。'
		},
		
		// Intelligence:
		{
			text: function () {
				return '智力: ' + gs.pc.intelligence + ' -> ' + (gs.pc.intelligence + 1);
			},
			nextLine: 'exit',
			func: intFunc,
			desc: '智力:\n增加你的法术力量和最高法力值。'
		},
	];
	
	this.dialogMenu.open(dialog);
};

// OPEN_HELP_MENU:
// ************************************************************************************************
gs.openHelpMenu = function () {
	var dialog = [];
	
	dialog[0] = {};
	dialog[0].text = '键盘操作：' + '\n\n';
	dialog[0].text += '小键盘：八方向移动、攻击、互动。' + '\n';
	dialog[0].text += '小键盘[5]：等待一回合。' + '\n';
	dialog[0].text += '[A]：远程定位，小键盘[5]确认。' + '\n';
	dialog[0].text += '[W]：切换到上一把武器。' + '\n';
	dialog[0].text += '[R]：重复施放上一个法术。' + '\n';
	dialog[0].text += '[E]：自动探索。' + '\n';
	dialog[0].responses = [{text: '键盘操作', nextLine: 0},
						   {text: '鼠标操作', nextLine: 1},
						   {text: '通用建议', nextLine: 2},
						   {text: '[结束]', nextLine: 'exit'}];
	
	dialog[1] = {};
	dialog[1].text = '鼠标操作：' + '\n\n';
	dialog[1].text += '点击地砖：移动、攻击、互动。' + '\n';
	dialog[1].text += '点击自己：等待一回合。' + '\n';
	dialog[1].text += '点击小地图：移动到该处。' + '\n';
	dialog[1].text += '点击背包：使用/装备物品。' + '\n';
	dialog[1].responses = dialog[0].responses;
	
	dialog[2] = {};
	dialog[2].text = '你的长矛有2格攻击距离，应该可以对大多数敌人进行无伤攻击。';
	dialog[2].responses = [{text: '[更多]', nextLine: 3},
						   {text: '键盘操作', nextLine: 0},
						   {text: '鼠标操作', nextLine: 1},
						   {text: '[结束]', nextLine: 'exit'}];
	
	dialog[3] = {};
	dialog[3].text = '等待一回合是让敌人自己走到最佳位置的好办法。通常更好的做法是先找一个好位置，让敌人来找你。';
	dialog[3].responses = [{text: '[更多]', nextLine: 4},
						   {text: '键盘操作', nextLine: 0},
						   {text: '鼠标操作', nextLine: 1},
						   {text: '[结束]', nextLine: 'exit'}];
	
	dialog[4] = {};
	dialog[4].text = '水域、瓦砾、藤蔓等地面会让人站不稳。任何处于不稳定状态的角色（包括你自己）都会被自动暴击。';
	dialog[4].responses = [{text: '[更多]', nextLine: 5},
						   {text: '键盘操作', nextLine: 0},
						   {text: '鼠标操作', nextLine: 1},
						   {text: '[结束]', nextLine: 'exit'}];
	
	dialog[5] = {};
	dialog[5].text = '你的治疗物品非常珍贵。升级时以及在地牢中找到恢复池时都会回满生命值。尽量节省你的消耗品。';
	dialog[5].responses = [{text: '[更多]', nextLine: 6},
						   {text: '键盘操作', nextLine: 0},
						   {text: '鼠标操作', nextLine: 1},
						   {text: '[结束]', nextLine: 'exit'}];
	
	this.dialogMenu.open(dialog);
};

// UI_TOGGLE_BUTTON:
// ************************************************************************************************
function UIToggleButton(x, y, tileset, upFrame, downFrame, group) {
	
	gs.createSprite(x, y, 'Slot', group);
	this.button = gs.createButton(x + 2, y + 2, tileset, this.clicked, this, group);
	this.button.frame = upFrame;
	this.state = 'UP';
	this.upFrame = upFrame;
	this.downFrame = downFrame;
}

UIToggleButton.prototype.toggleUp = function () {
	this.state = 'UP';
	this.button.frame = this.upFrame;
};

UIToggleButton.prototype.toggleDown = function () {
	this.state = 'DOWN';
	this.button.frame = this.downFrame;
};

UIToggleButton.prototype.clicked = function () {
	if (this.state === 'UP') {
		this.toggleDown();
	} else {
		this.toggleUp();
	}
};

UIToggleButton.prototype.isDown = function () {
	return this.state === 'DOWN';
};