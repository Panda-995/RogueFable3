/*global translator, Phaser*/
'use strict';

// 中文渲染挂钩
// ---------------------------------------------------------------------------
// 原项目只在 16 个文件里显式调用 translator.getText()，大量显示名（商店价签、
// HUD 状态条、tooltip 等）直接把英文标识符丢进 Phaser.Text，中文界面会漏译。
//
// Phaser 2.x 的 Phaser.Text 构造函数只把初始文本写进 this._text，this.text 由
// setText() 赋值，而所有渲染路径（构造 / setText / setStyle）最终都汇聚到
// updateText() —— 它是文本上屏的唯一出口。因此在这里挂钩可以一处覆盖全部。
//
// 为零副作用：渲染时临时把 this.text 换成译文，渲染完立刻还原，this._text 与
// 游戏逻辑看到的始终是原始字符串。词库查不到时原样输出，英文回退完全无损。

(function () {
	if (typeof translator === 'undefined' || typeof translator.translate !== 'function') {
		console.warn('[i18n] translator.js 未先行加载，中文挂钩未启用');
		return;
	}

	if (typeof Phaser === 'undefined' || !Phaser.Text || !Phaser.Text.prototype.updateText) {
		console.warn('[i18n] Phaser.Text.updateText not found, 中文挂钩未启用');
		return;
	}

	var originalUpdateText = Phaser.Text.prototype.updateText;
	var enabled = true;

	Phaser.Text.prototype.updateText = function () {
		if (!enabled || typeof this.text !== 'string') {
			return originalUpdateText.call(this);
		}

		var original = this.text;
		var translated = translator.translate(original);

		if (translated === original) {
			return originalUpdateText.call(this);
		}

		this.text = translated;
		try {
			return originalUpdateText.call(this);
		} finally {
			this.text = original;
		}
	};

	// 允许按需关闭（例如排查渲染问题）
	window.i18n = {
		disable: function () { enabled = false; },
		enable: function () { enabled = true; },
		size: function () { return translator.size ? translator.size() : -1; }
	};

	console.log('[i18n] 中文渲染挂钩已启用');
})();
