class MyElement extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({ mode: "open" });
		const root = document.createElement('div');
		shadow.appendChild(root);
	}

	isCustomElement() {
		return true;
	}

	isBaseElement() {
		return true;
	}
}

export default MyElement;
