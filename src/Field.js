/**
* Field webcomponent
* @since 1.0.0
* @class
* @public
* @tagname my-field
*/
class Field extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({ mode: "open" });
		const root = document.createElement('div');
		const input = document.createElement('input');
		input.setAttribute("type", "text");
		input.setAttribute("placeholder", "Hello, this is a text field");
		const style = document.createElement('style');

		shadow.appendChild(style);
		root.appendChild(input)
		shadow.appendChild(root);
	}
}

window.customElements.define("my-field", Field);

export default Field;
