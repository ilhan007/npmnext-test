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

	get baseElement() {
		return true;
	}

	get hasContent() {
		return false;
	}
}

export default MyElement;
