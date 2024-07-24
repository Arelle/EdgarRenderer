/* Created by staff of the U.S. Securities and Exchange Commission.
 * Data and content created by government employees within the scope of their employment
 * are not subject to domestic copyright protection. 17 U.S.C. 105.
 */

export class SetCustomCSS {

	constructor() {
		this.set();
	}

	init() {
		const taggedData = localStorage.getItem("taggedData") || "FF6600";
		const searchResults = localStorage.getItem("searchResults") || "FFD700";
		const selectedFact = localStorage.getItem("selectedFact") || "003768";
		const tagShading = localStorage.getItem("tagShading") || "rgba(255,0,0,0.3)";
		const textBlock = localStorage.getItem("textBlock") || "#003768";
		const cssObject = {
			'#dynamic-xbrl-form [enabled-fact="true"][continued-fact="false"], #settings-modal .enabled-example': {
				"box-shadow": `inset 0px 2px #${taggedData}, inset 0px -2px #${taggedData}`,
				display: "inline",
			},
			'#dynamic-xbrl-form [enabled-fact="true"][continued-main-fact="true"]': {
				"box-shadow": `
					-2px 0px white, 2px 0px white,
					-4px 0px #${taggedData}, 4px 0px #${taggedData}`,
				display: "inline-block",
			},
			'#dynamic-xbrl-form [enabled-fact="true"][continued-main-fact="true"][text-block-fact="true"]': {
				"box-shadow": `
					-2px 0px white, 2px 0px white,
					-4px 0px #${taggedData}, 4px 0px #${taggedData}`, 
				display: "block",
			},
			'#dynamic-xbrl-form [enabled-fact="true"][text-block-fact="true"]': {
				"box-shadow": `
					-2px 0px white, 2px 0px white,
					-4px 0px #${taggedData}, 4px 0px #${taggedData}`, 
				display: "block",
				"border-top": "none",
				"border-bottom": "none",
			},

			'#dynamic-xbrl-form [highlight-fact="true"], #settings-modal .highlighted-example': {
				"background-color": `#${searchResults} !important`
			},
			'#dynamic-xbrl-form [highlight-fact="true"] > *': {
				"background-color": `#${searchResults} !important`
			},

			'#dynamic-xbrl-form [selected-fact="true"], #settings-modal .selected-fact-example': {
				border: `3px solid #${selectedFact} !important`,
				display: "inline"
			},
			'#dynamic-xbrl-form [selected-fact="true"][continued-main-fact="true"]': {
				"box-shadow":
					`-2px 0px 0px 0px #${searchResults}, 2px 0px 0px 0px #${searchResults}`
			},
			'#dynamic-xbrl-form [selected-fact="true"][text-block-fact="true"]': {
				"box-shadow":
					`-2px 0px 0px 0px #${selectedFact}, 2px 0px 0px 0px #${selectedFact}`
			},
			'#dynamic-xbrl-form [selected-fact="true"][continued-fact="false"]': {
				border: `3px solid #${selectedFact} !important`,
				display: "inline"
			},

			'#dynamic-xbrl-form [enabled-fact="true"][continued-fact="false"]:hover, #settings-modal span.tag-shading-example': {
				'background-color': `${tagShading} !important`,
			},
			// '#settings-modal span.tag-shading-example': {
			// 	'background-color': `${tagShading} !important`,
			// },
			'#dynamic-xbrl-form [hover-fact="true"] *, #dynamic-xbrl-form [hover-fact="true"]': {
				"background-color": `${tagShading} !important`,
			},

			"#dynamic-xbrl-form .text-block-indicator-left, .text-block-indicator-left": {
				"border-left-color": `#${textBlock}`
			},
			"#dynamic-xbrl-form .text-block-indicator-right, .text-block-indicator-right": {
				"border-right-color": `#${textBlock}`
			},
		};

		let cssString = "";

		for (const key in cssObject) {
			cssString += " " + key + "{";
			for (const nestedKey in cssObject[key]) {
				cssString += nestedKey + ":" + cssObject[key][nestedKey] + ";";
			}
			cssString += "}\n";
		}
		const head = document.head || document.getElementsByTagName("head")[0];
		const style = ( document.getElementById("customized-styles") || document.createElement("style") ) as HTMLStyleElement;
		style.innerHTML = '';
		head.appendChild(style);

		style.type = "text/css";
		style.id = "customized-styles";

		style.appendChild(document.createTextNode(cssString));
	}
	set() {

		this.init();
		const taggedData = localStorage.getItem("taggedData") || "FF6600";
		const searchResults = localStorage.getItem("searchResults") || "FFD700";
		const selectedFact = localStorage.getItem("selectedFact") || "003768";
		const tagShading = localStorage.getItem("tagShading") || "rgba(255,0,0,0.3)";
		const textBlock = localStorage.getItem("textBlock") || "003768";
		const pickrOptions = [
			{
				selector: "#tagged-data-color-picker",
				default: taggedData,
				storage: "taggedData",
				reset: "FF6600"
			},
			{
				selector: "#search-results-color-picker",
				default: searchResults,
				storage: "searchResults",
				reset: "FFD700"
			},
			{
				selector: "#selected-fact-color-picker",
				default: selectedFact,
				storage: "selectedFact",
				reset: "003768"
			},
			{
				selector: "#tag-shading-color-picker",
				default: tagShading,
				storage: "tagShading",
				reset: "rgba(255,0,0,0.3)"
			},
			{
				selector: "#text-block-color-picker",
				default: textBlock,
				storage: "textBlock",
				reset: "003768"
			}
		];

		const rgbToHex = (input: string) => {
			const rgb = input.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s]+)?/i);
			if (rgb) {
				const hex = [
					(rgb[1] | 1 << 8).toString(16).slice(1),
					(rgb[2] | 1 << 8).toString(16).slice(1),
					(rgb[3] | 1 << 8).toString(16).slice(1)
				].join('');
				return hex;
			}
		};

		const hexToRgb = (input: string) => {
			const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(input);
			return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)})`;
		};

		pickrOptions.forEach((current, index) => {
			const colorPicker = document.querySelector(current.selector) as HTMLInputElement;
			const colorReset = document.querySelector(`${current.selector}-reset`) as HTMLInputElement;
			if (index === 3) {
				const colorRange = document.querySelector('#tag-shading-color-picker-range') as HTMLInputElement;
				colorRange.addEventListener('change', event => {
					//we save this as rgba();
					const rgb = hexToRgb((colorPicker.value as string).replace("#", "").substring(0, 6));
					const updated = rgb.replace(')', `, ${(event?.target?.value as number / 10)})`);
					localStorage.setItem(current.storage, updated);
					this.init();
				});
			}

			colorPicker.value = index === 3 ? colorPicker.value = `#${rgbToHex(current.default)}` : `#${current.default}`;
			colorPicker.addEventListener('change', event => {
				console.log('change')
				if (index === 3) {
					//we save this as rgba();
					const colorRange = document.querySelector('#tag-shading-color-picker-range') as HTMLInputElement;
					const rgb = hexToRgb((event?.target?.value as string).replace("#", "").substring(0, 6));
					const range = colorRange.value;
					const updated = rgb.replace(')', `, ${(range as number / 10)})`);
					localStorage.setItem(current.storage, updated);
				} else {
					const hex = (event?.target?.value as string).replace("#", "").substring(0, 6);
					localStorage.setItem(current.storage, hex);
				}
				this.init();
			});
			colorReset.addEventListener('click', () => {
				colorPicker.value = index === 3 ? colorPicker.value = `#${rgbToHex(current.default)}` : `#${current.default}`;
				index === 3 ? (document.querySelector('#tag-shading-color-picker-range') as HTMLInputElement).value = (parseFloat(current.default.split(',')[3]) * 10).toString() : null;
				localStorage.setItem(current.storage, current.reset);
				this.init();
			});
			colorReset.addEventListener('keyup', () => {
				colorPicker.value = index === 3 ? colorPicker.value = `#${rgbToHex(current.default)}` : `#${current.default}`;
				index === 3 ? (document.querySelector('#tag-shading-color-picker-range') as HTMLInputElement).value = (parseFloat(current.default.split(',')[3]) * 10).toString() : null;
				localStorage.setItem(current.storage, current.reset);
				this.init();
			});
		});

	}
}
