/**
 * 提取 AI 繪圖的 Prompt
 */
class AiDrawingPrompt {


	/**
	 * Automatic1111 (字串分割)
	 */
	public static getSdwebui(val: string) {

		/**
			剖析參數，例如
			傳入 Sampler: DPM++ 2M Karras, ADetailer prompt: "\"blue eyes\", smileing: 0.8, open mouth"
			回傳 [
				{title:"Sampler", text: "DPM++ 2M Karras"}, 
				{title:"ADetailer prompt", text: `"blue eyes", smileing: 0.8, open mouth`}
			]
		*/
		function parseParameters(input: string) {

			// 先把 \" 替換成其他符號，避免剖析失敗
			input = input.replace(/\\"/g, "\uFDD9");

			// 切割
			let parts = [];
			let stack = [];
			let partStart = 0;
			for (let i = 0; i < input.length; i++) {
				if (input[i] === '{') {
					stack.push('{');
				} else if (input[i] === '}') {
					if (stack.length > 0 && stack[stack.length - 1] === '{') {
						stack.pop();
					}
				} else if (input[i] === '"') {
					if (stack.length > 0 && stack[stack.length - 1] === '"') {
						stack.pop();
					} else {
						stack.push('"');
					}
				} else if (input[i] === ',' && stack.length === 0) {
					parts.push(input.slice(partStart, i));
					partStart = i + 1;
				}
			}
			parts.push(input.slice(partStart));
			parts = parts.map(s => s.replace(/\uFDD9/g, '\\"').trim());

			let result = [];
			for (let i = 0; i < parts.length; i++) {
				let subParts = parts[i].split(":");
				let title = subParts[0].trim();
				let text = subParts.slice(1).join(":").trim();
				if (text.startsWith('"') && text.endsWith('"')) { // 開頭跟結尾是 "									
					text = text.slice(1, -1); // 去除開頭跟結尾的"
					text = text.replace(/\\n/g, "\n"); // 處理換行
					text = text.replace(/\\["]/g, '"'); // 把內容裡面的 \" 處理成 "
				}
				let jsonF = Lib.jsonStrFormat(text);
				if (jsonF.ok) { // 如果是json (例如 Hashes
					text = jsonF.jsonFormat; // 格式化json再顯示
				} else {
					if (title === "Tiled Diffusion" && text.startsWith('{') && text.endsWith('}')) { //格式例如 {'Method': 'MultiDiffusion', 'Tile tile width': 96}
						text = text.replace(/[,][ ]/g, `, \n`);
					}
					if (title === "Lora hashes" || title === "TI hashes") {
						text = text.replace(/[,][ ]/g, `, \n`);
					}
					if (title === "ControlNet" || title === "ControlNet 0" || title === "ControlNet 1" || title === "ControlNet 2") {
						let lines = text.split(/,(?![^()]*\))(?![^\[\]]*\])(?![^{}]*})(?![^"]*")/).map(line => line.trim());
						text = lines.join(", \n");
					}
				}

				result.push({ title: title, text: text });
			}
			return result;
		}

		/**
		 * 依照大項目進行切割
		 */
		function parseString(str: string) {
			let result: { key: string, value: string }[] = [];

			let keys = ["Prompt", "Negative prompt", "Steps", "Template", "Negative Template"];
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i];
				let index = str.indexOf(key + ":");
				if (index !== -1) {
					let endIndex = str.length;
					for (let j = i + 1; j < keys.length; j++) {
						let nextIndex = str.indexOf(keys[j] + ":");
						if (nextIndex !== -1) {
							endIndex = nextIndex;
							break;
						}
					}
					let value = str.slice(index + key.length + 1, endIndex).trim();
					result.push({ key, value });
				}
			}
			return result;
		}

		function retPush(title: string, text: string | undefined) {
			if (text !== undefined && text !== "") {
				retData.push(
					{
						title: title,
						text: text
					}
				);
			}
		}

		//提示詞不會有 title，所以要補上
		if (val.startsWith("Negative prompt:") === false && val.startsWith("Steps:") === false) {
			val = "Prompt: " + val;
		}
		var retData: { title: string, text: string }[] = [];
		let arItem = parseString(val);

		for (let i = 0; i < arItem.length; i++) {
			const item = arItem[i];
			if (item.key === "Steps") {
				let arOther = parseParameters("Steps: " + item.value);
				for (let i = 0; i < arOther.length; i++) {
					const title = arOther[i].title;
					const text = arOther[i].text;
					retPush(title, text);
				}
			} else {
				retPush(item.key, item.value); //提示
			}
		}

		return retData;
	}


	/**
	 * ComfyUI (找到起始節點後，以遞迴方式找出相關節點)
	 */
	public static getComfyui(jsonStr: string) {
		var KSAMPLER_TYPES = ["KSampler", "KSamplerAdvanced", "FaceDetailer"]; //起始節點(不一定找得到)
		var MODEL_TYPES = ["ckpt_name", "lora_name"]; //模型名稱
		var SEED_TYPES = ["seed", "noise_seed"];

		let json: any;

		try {
			json = JSON.parse(jsonStr);
		} catch (e) {
			return [];
		}

		var retData: { title: string, text: string }[] = [];
		var arKey = Object.keys(json);

		var _prompt;
		var _negativePrompt;

		function retPush(title: string, text: string | undefined) {
			if (text !== undefined && text !== null && text !== "") {
				retData.push(
					{
						title: title,
						text: text.toString().trim()
					}
				);
			}
		}
		function getKey(obj: any) {
			if (obj === undefined) { return undefined; }
			if (Array.isArray(obj) === false) { return undefined; }
			if (obj.length === 0) { return undefined; }
			return obj[0];
		}
		function getVal(obj: any) {
			if (obj === undefined) { return undefined; }
			return obj.toString();
		}

		// 用於遞迴找出目標節點的id
		function getUnknownKey(obj: any, key: string[]) {
			if (obj === undefined) { return undefined; }
			let keys = Object.keys(obj);
			if (keys.length === 0) { return undefined; }

			let index = 0;
			for (let i = 0; i < key.length; i++) {
				let k = keys.indexOf(key[i]);
				if (k !== -1) {
					index = k;
					break;
				}
			}
			let firstKey = keys[index];
			return getKey(obj[firstKey]);
		}

		// 取得 Seed
		function getSeed(inputs: any) {
			for (let i = 0; i < SEED_TYPES.length; i++) {
				let text = inputs[SEED_TYPES[i]];
				if (text !== undefined) {
					return text.toString();
				}
			}
			return undefined;
		}

		//取得模型名稱
		function getModel(key: string, key2: string[]) {
			if (key === undefined) { return undefined; }
			let obj = json[key];
			if (obj === undefined) { return undefined; }
			let inputs = obj.inputs;
			if (inputs === undefined) { return undefined; }

			for (let i = 0; i < MODEL_TYPES.length; i++) {
				let text = inputs[MODEL_TYPES[i]];
				if (text !== undefined) {
					return text.toString();
				}
			}

			let newKey = getUnknownKey(inputs, key2);
			if (newKey !== undefined) {
				return getModel(newKey, key2)
			}

			return undefined;
		}

		//取得提示詞
		function getPrompt(key: string, key2: string[]) {
			if (key === undefined) { return undefined; }
			let obj = json[key];
			if (obj === undefined) { return undefined; }
			let inputs = obj.inputs;
			if (inputs === undefined) { return undefined; }

			//取得 text | text_g | text_l
			let text;
			let arKey = Object.keys(inputs);
			for (let i = 0; i < key2.length; i++) {
				const key = key2[i];
				for (let j = 0; j < arKey.length; j++) {
					if (arKey[j].includes(key)) {
						text = inputs[arKey[j]];
						if (text !== undefined && typeof text === "string") {
							return text.toString();
						}
					}
				}
			}

			// 如果沒有找到 text，則取得新的 key 來遞迴
			let newKey = getUnknownKey(inputs, key2);
			if (newKey !== undefined && newKey !== key) {
				return getPrompt(newKey, key2)
			}

			return undefined;
		}

		//取得 寬度與高度
		function getSize(key: string) {
			if (key === undefined) { return undefined; }
			let obj = json[key];
			if (obj === undefined) { return undefined; }
			let inputs = obj.inputs;
			if (inputs === undefined) { return undefined; }

			let width = inputs.width;
			let height = inputs.height;
			if (width === undefined || height === undefined) { return undefined; }
			return `${width} x ${height}`;

		}

		let mianInputs;
		for (let i = 0; i < arKey.length; i++) {
			const item = json[arKey[i]];
			let classType = item.class_type;

			if (classType !== undefined && KSAMPLER_TYPES.includes(classType)) {
				mianInputs = item.inputs;

				if (mianInputs !== undefined) {
					let seed = getSeed(mianInputs);
					let samplerName = getVal(mianInputs.sampler_name);
					let cfg = getVal(mianInputs.cfg);
					let steps = getVal(mianInputs.steps);
					let scheduler = getVal(mianInputs.scheduler);
					let denoise = getVal(mianInputs.denoise);

					let model = getModel(getKey(mianInputs.model), ["model"]);
					let size = getSize(getKey(mianInputs.latent_image));

					let prompt = getPrompt(getKey(mianInputs.positive), ["positive", "text", "conditioning"]);
					if (prompt == _prompt) { //如果已經加入過相同的提示詞，則略過
						prompt = undefined;
					} else {
						_prompt = prompt;
					}

					let negativePrompt = getPrompt(getKey(mianInputs.negative), ["negative", "text", "conditioning"]);
					if (negativePrompt == _negativePrompt) {
						negativePrompt = undefined;
					} else {
						_negativePrompt = negativePrompt;
					}

					retPush("Model", model);
					retPush("Prompt", prompt);
					retPush("Negative prompt", negativePrompt);
					retPush("Size", size);
					retPush("Seed", seed);
					retPush("Steps", steps);
					retPush("CFG scale", cfg);
					retPush("Sampler", samplerName);
					retPush("Scheduler", scheduler);
					retPush("Denoise", denoise);
				}
			}
		}

		return retData;
	}


	/**
	 * InvokeAI (解析 json)
	 */
	public static getInvokeai(jsonStr: string) {
		let json: any;

		try {
			json = JSON.parse(jsonStr);
		} catch (e) {
			return [];
		}

		var retData: { title: string, text: string }[] = [];
		let arkey = Object.keys(json);
		let objImage; // json裡面的圖片節點

		function retPush(title: string, text: string | undefined) {
			if (text !== undefined && text !== null && text !== "") {
				retData.push(
					{
						title: title,
						text: text.toString().trim()
					}
				);
			}
		}

		for (let i = 0; i < arkey.length; i++) {
			let title = arkey[i];
			let text = json[title];

			if (title === "images" && text.length > 0) { //如果是圖片陣列(連續產圖)，則只抓第一張
				objImage = text[0];
				continue;
			}
			if (title === "image") {
				objImage = text;
				continue;
			}

			if (typeof text === "object") {
				text = Lib.jsonStrFormat(text).jsonFormat;
			}

			retPush(title, text);
		}


		if (objImage !== undefined) {

			let prompt = objImage.prompt[0].prompt;
			let seed = objImage.seed;
			let steps = objImage.steps;
			let cfg = objImage.cfg_scale;
			let sampler = objImage.sampler;

			retPush("Prompt", prompt);
			retPush("Seed", seed);
			retPush("Steps", steps);
			retPush("CFG", cfg);
			retPush("Sampler", sampler);
		}

		return retData;
	}


	/**
	 * NovelAI (解析 json)
	 */
	public static getNovelai(jsonStr: string) {
		let json: any;

		try {
			json = JSON.parse(jsonStr);
		} catch (e) {
			return [];
		}

		var retData: { title: string, text: string }[] = [];
		let arkey = Object.keys(json);

		function retPush(title: string, text: string | undefined) {
			if (text !== undefined && text !== null && text !== "") {
				retData.push(
					{
						title: title,
						text: text.toString().trim()
					}
				);
			}
		}

		for (let i = 0; i < arkey.length; i++) {
			let title = arkey[i];
			let text = json[title];

			if (typeof text === "object") {
				text = Lib.jsonStrFormat(text).jsonFormat;
			}

			retPush(title, text);
		}

		return retData;
	}
}