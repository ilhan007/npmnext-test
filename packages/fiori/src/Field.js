/**
* Field webcomponent, wrapping a native input.
* @since 1.0.0
* @class
* @public
* @tagname my-field
* @package @next-sample/fiori
*/
class MyField extends HTMLElement {
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
		//comment
	}
}

window.customElements.define("my-field", MyField);

export default MyField;
