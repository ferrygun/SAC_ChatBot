(function () {
    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
          fieldset {
              margin-bottom: 10px;
              border: 1px solid #afafaf;
              border-radius: 3px;
          }
          table {
              width: 100%;
          }
          input, textarea, select {
              font-family: "72",Arial,Helvetica,sans-serif;
              width: 100%;
              padding: 4px;
              box-sizing: border-box;
              border: 1px solid #bfbfbf;
          }
          input[type=checkbox] {
              width: inherit;
              margin: 6px 3px 6px 0;
              vertical-align: middle;
          }
      </style>
      <form id="form" autocomplete="off">
        <fieldset> 
          <legend>General</legend>
          <table>
            <tr>
              <td><label for="Socket URL">Socket URL</label></td>
              <td><input id="socketurl" name="socketurl" type="text"></td>
            </tr>
            <tr>
              <td><label for="Channel ID">Channel ID</label></td>
              <td><input id="channelid" name="channelid" type="text"></td>
            </tr>
            <tr>
              <td><label for=Token">Token</label></td>
              <td><input id="token" name="token" type="text"></td>
            </tr>
            <tr>
              <td><label for="Preferences">Preferences</label></td>
              <td><input id="preferences" name="preferences" type="text"></td>
            </tr>
          </table>
        </fieldset>
        <button type="submit" hidden>Submit</button>
      </form>
    `;

    class CAI3Aps extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: "open" });
            this._shadowRoot.appendChild(tmpl.content.cloneNode(true));

            let form = this._shadowRoot.getElementById("form");
            form.addEventListener("submit", this._submit.bind(this));
            form.addEventListener("change", this._change.bind(this));
        }

        connectedCallback() {
        }

        _submit(e) {
            e.preventDefault();
            let properties = {};
            for (let name of CAI3Aps.observedAttributes) {
                properties[name] = this[name];
            }
            this._firePropertiesChanged(properties);
            return false;
        }
        _change(e) {
            this._changeProperty(e.target.name);
        }
        _changeProperty(name) {
            let properties = {};
            properties[name] = this[name];
            this._firePropertiesChanged(properties);
        }

        _firePropertiesChanged(properties) {
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: properties
                }
            }));
        }

        get socketurl() {
            return this.getValue("socketurl");
        }
        set socketurl(value) {
            this.setValue("socketurl", value);
        }

        get channelid() {
            return this.getValue("channelid");
        }
        set channelid(value) {
            this.setValue("channelid", value);
        }

        get token() {
            console.log(this.getValue("token"));
            return this.getValue("token");
        }
        set token(value) {
            this.setValue("token", value);
        }

        get preferences() {
            return this.getValue("preferences");
        }
        set preferences(value) {
            this.setValue("preferences", value);
        }        

        getValue(id) {
            return this._shadowRoot.getElementById(id).value;
        }
        setValue(id, value) {
            this._shadowRoot.getElementById(id).value = value;
        }

        static get observedAttributes() {
            return [
                "socketurl",
                "channelid",
                "token",
                "preferences"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }
    }
    customElements.define("com-fd-djaja-sap-sac-cai3-aps", CAI3Aps);
})();
