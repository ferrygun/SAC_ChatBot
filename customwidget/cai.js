(function() {
    let _shadowRoot;
    let _id;

    let div;
    let Ar = [];
    let widgetName;
    let _message

    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
      <style>
      </style>
      <div id="ui5_content" name="ui5_content">
         <slot name="content"></slot>
      </div>

        <script id="oView" name="oView" type="sapui5/xmlview">
            <mvc:View
                controllerName="MyController"
                xmlns:core="sap.ui.core"
                xmlns:mvc="sap.ui.core.mvc"
                xmlns="sap.m"
                class="viewPadding">
                
             <DatePicker id="dateId" value="{/dateValue}"
                          width="50%" change="onButtonPress"/>
            </mvc:View>
        </script>    
    `;

    class CAI3 extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();

            //_shadowRoot.querySelector("#oView").id = _id + "_oView";

            this._export_settings = {};
            this._export_settings.channelid = "";
            this._export_settings.token = "";
            this._export_settings.preferences = "";
            this._export_settings.socketurl = "";
            this._export_settings.sessionid = "";

            this.addEventListener("click", event => {
                console.log('click');
            });

            this._firstConnection = 0;
            this._firstConnectionUI5 = 0;
        }

        connectedCallback() {
            try {
                if (window.commonApp) {
                    let outlineContainer = commonApp.getShell().findElements(true, ele => ele.hasStyleClass && ele.hasStyleClass("sapAppBuildingOutline"))[0]; // sId: "__container0"

                    if (outlineContainer && outlineContainer.getReactProps) {
                        let parseReactState = state => {
                            let components = {};

                            let globalState = state.globalState;
                            let instances = globalState.instances;
                            let app = instances.app["[{\"app\":\"MAIN_APPLICATION\"}]"];
                            let names = app.names;

                            for (let key in names) {
                                let name = names[key];

                                let obj = JSON.parse(key).pop();
                                let type = Object.keys(obj)[0];
                                let id = obj[type];

                                components[id] = {
                                    type: type,
                                    name: name
                                };
                            }

                            for (let componentId in components) {
                                let component = components[componentId];
                            }

                            let metadata = JSON.stringify({
                                components: components,
                                vars: app.globalVars
                            });

                            if (metadata != this.metadata) {
                                this.metadata = metadata;

                                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                                    detail: {
                                        properties: {
                                            metadata: metadata
                                        }
                                    }
                                }));
                            }
                        };

                        let subscribeReactStore = store => {
                            this._subscription = store.subscribe({
                                effect: state => {
                                    parseReactState(state);
                                    return {
                                        result: 1
                                    };
                                }
                            });
                        };

                        let props = outlineContainer.getReactProps();
                        if (props) {
                            subscribeReactStore(props.store);
                        } else {
                            let oldRenderReactComponent = outlineContainer.renderReactComponent;
                            outlineContainer.renderReactComponent = e => {
                                let props = outlineContainer.getReactProps();
                                subscribeReactStore(props.store);

                                oldRenderReactComponent.call(outlineContainer, e);
                            }
                        }
                    }
                }
            } catch (e) {}
        }

        disconnectedCallback() {
            if (this._subscription) { // react store subscription
                this._subscription();
                this._subscription = null;
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            if ("designMode" in changedProperties) {
                this._designMode = changedProperties["designMode"];
            }
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            var that = this;

            if (this._firstConnection === 0) {
                this._firstConnection = 1;
                let ui5js = "http://localhost/SAC/saccai/socket.io.js";
                async function LoadLibs() {
                    try {
                        await loadScript(ui5js, _shadowRoot);
                    } catch (e) {
                        alert(e);
                    } finally {
                        loadthis(that, changedProperties);
                    }
                }
                LoadLibs();
            }
        }

        _renderExportButton() {
            let components = this.metadata ? JSON.parse(this.metadata)["components"] : {};
            console.log("_renderExportButton-components");
            console.log(components);
            console.log("end");
        }

        _firePropertiesChanged() {
            this.sessionid = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        sessionid: this.sessionid
                    }
                }
            }));
        }

        // SETTINGS
        get channelid() {
            return this._export_settings.channelid;
        }
        set channelid(value) {
            this._export_settings.channelid = value;
        }

        get token() {
            return this._export_settings.token;
        }
        set token(value) {
            this._export_settings.token = value;
        }

        get preferences() {
            return this._export_settings.preferences;
        }
        set preferences(value) {
            this._export_settings.preferences = value;
        }

        get socketurl() {
            return this._export_settings.socketurl;
        }
        set socketurl(value) {
            this._export_settings.socketurl = value;
        }

        get sessionid() {
            return this._export_settings.sessionid;
        }
        set sessionid(value) {
            console.log("hello is me");
            value = _message;
            this._export_settings.sessionid = value;
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
    customElements.define("com-fd-djaja-sap-sac-cai3", CAI3);

    //function to create an UI5 dialog box based on sap.suite.ui.commons.MicroProcessFlow 
    function UI5(changedProperties, that, socketid) {
        var that_ = that;

        div = document.createElement('div');
        widgetName = changedProperties.widgetName;
        div.slot = "content_" + widgetName;

        if(that._firstConnectionUI5 === 0) {
            console.log("--First Time --");

            let div0 = document.createElement('div');
            div0.innerHTML = '<?xml version="1.0"?><script id="oView_' + widgetName + '" name="oView_' + widgetName + '" type="sapui5/xmlview"><mvc:View xmlns="sap.suite.ui.commons" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns:m="sap.m" controllerName="myView.Template"><MicroProcessFlow width="400px" renderType="ScrollingWithResizer"><content><MicroProcessFlowItem state="{' + widgetName + '>/state}" press="itemPress"><customData><core:CustomData key="title" value="{' + widgetName + '>/title}"/><core:CustomData key="icon" value="{' + widgetName + '>/icon}"/><core:CustomData key="subTitle" value="{' + widgetName + '>/subTitle}"/><core:CustomData key="description" value="{' + widgetName + '>/description}"/></customData></MicroProcessFlowItem></content></MicroProcessFlow></mvc:View></script>';
            _shadowRoot.appendChild(div0);

            let div1 = document.createElement('div');
            div1.innerHTML = '<div id="ui5_content_' + widgetName + '" name="ui5_content_' + widgetName + '"><slot name="content_' + widgetName + '"></slot></div>';
            _shadowRoot.appendChild(div1);

            that_.appendChild(div);

            var mapcanvas_divstr = _shadowRoot.getElementById('oView_' + widgetName);

            Ar.push({
                'id': widgetName,
                'div': mapcanvas_divstr
            });
            console.log(Ar);
        }

        sap.ui.getCore().attachInit(function() {
            "use strict";

            //### Controller ###
            sap.ui.define([
                "jquery.sap.global",
                "sap/ui/core/mvc/Controller",
                "sap/ui/model/json/JSONModel",
                "sap/m/MessageToast",
                "sap/ui/core/library",
                "sap/ui/core/Core",
                'sap/ui/model/Filter',
                'sap/m/library',
                'sap/m/MessageBox'
            ], function(jQuery, Controller, JSONModel, MessageToast, coreLibrary, Core, Filter, mobileLibrary, MessageBox) {
                "use strict";

                return Controller.extend("myView.Template", {

                    onInit: function() {
                        console.log("----init----");
                        console.log("widgetName:" + widgetName);

                        if(that._firstConnectionUI5 === 0) {
                            that._firstConnectionUI5 = 1;

                            this._ui_settings = {};

                            if(socketid !== "") {
                                this._ui_settings.state = "Success";
                                this._ui_settings.title = "chat id " + socketid;  
                                this._ui_settings.icon = "sap-icon://accept";
                                this._ui_settings.subTitle = "Please copy the chat id above into the chat dialog";
                                this._ui_settings.description = "";
                            } else {
                                this._ui_settings.state = "Error";
                                this._ui_settings.title = "No connection to the server";
                                this._ui_settings.icon = "sap-icon://error";
                                this._ui_settings.subTitle = "";
                                this._ui_settings.description = "";
                            }

                            this._oModel = new JSONModel({
                                state: this._ui_settings.state,
                                title: this._ui_settings.title,
                                icon: this._ui_settings.icon,
                                subTitle: this._ui_settings.subTitle,
                                description: this._ui_settings.description
                            });

                            console.log(this._oModel);

                            sap.ui.getCore().setModel(this._oModel, widgetName);

                        } else {
                            console.log("----after----");
                            var oModel = sap.ui.getCore().getModel(widgetName);
                            
                            if(socketid !== "") {
                                oModel.setProperty("/state", "Success"); 
                                oModel.setProperty("/title", "chat id " + socketid);                            
                                oModel.setProperty("/icon", "sap-icon://accept");
                                oModel.setProperty("/subTitle", "Please copy the chat id above into the chat dialog");
                                oModel.setProperty("/description", "");
                            } else {
                                oModel.setProperty("/state", "Error"); 
                                oModel.setProperty("/title", "No connection to the Bot server");                            
                                oModel.setProperty("/icon", "sap-icon://error");
                                oModel.setProperty("/subTitle", "");
                                oModel.setProperty("/description", "");
                            }
                        }
                    },

                    handleInfoMessageBoxPress: function() {
                        MessageBox.information("chat id " + socketid);
                    },

                    _getColorByState: function(oItem) {
                        switch (oItem.getState()) {
                            case "Error":
                                return coreLibrary.IconColor.Negative;
                            case "Warning":
                                return coreLibrary.IconColor.Critical;
                            case "Success":
                                return coreLibrary.IconColor.Positive;
                        }
                    },


                    itemPress: function(oEvent) {
                        var oItem = oEvent.getSource(),
                            aCustomData = oItem.getCustomData(),
                            sTitle = aCustomData[0].getValue(),
                            sIcon = aCustomData[1].getValue(),
                            sSubTitle = aCustomData[2].getValue(),
                            sDescription = aCustomData[3].getValue();

                        var oPopover = new sap.m.Popover({
                            contentWidth: "350px",
                            title: "Chat ID",
                            content: [
                                new sap.m.HBox({
                                    items: [
                                        new sap.ui.core.Icon({
                                            src: sIcon,
                                            color: this._getColorByState(oItem)
                                        }).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginEnd"),
                                        new sap.m.FlexBox({
                                            width: "100%",
                                            renderType: "Bare",
                                            direction: "Column",
                                            items: [new sap.m.Title({
                                                    level: sap.ui.core.TitleLevel.H1,
                                                    text: sTitle
                                                }), new sap.m.Text({
                                                    text: sSubTitle
                                                }).addStyleClass("sapUiSmallMarginBottom sapUiSmallMarginTop"),
                                                new sap.m.Text({
                                                    text: sDescription
                                                })
                                            ]
                                        })
                                    ]
                                }).addStyleClass("sapUiTinyMargin")
                            ],
                            footer: [
                                new sap.m.Toolbar({
                                    content: [
                                        new sap.m.ToolbarSpacer(),
                                        new sap.m.Button({
                                            text: "Close",
                                            press: function() {
                                                oPopover.close();
                                            }
                                        })
                                    ]
                                })
                            ]
                        });

                        oPopover.openBy(oEvent.getParameter("item"));
                    }

                });
            });

            console.log("widgetName:" + widgetName);
            var foundIndex = Ar.findIndex(x => x.id == widgetName);
            var divfinal = Ar[foundIndex].div;

            //### THE APP: place the XMLView somewhere into DOM ###
            var oView = sap.ui.xmlview({
                viewContent: jQuery(divfinal).html(),
            });

            oView.placeAt(div);
        });
    }

    // UTILS
    function loadthis(that, changedProperties) {
        var that_ = that;
        var socketid;

        //Socket Connection
        //******************************************
        const socket = io(that._export_settings.socketurl);

        socket.on('disconnect', function() {
            console.log("socket disconnected: " + socketid);
            UI5(changedProperties, that, "");
        });

        socket.on('connect', function() {
            socketid = socket.id;
            console.log("socket connected: " + socketid);
            UI5(changedProperties, that, socketid);
        });

        socket.on('req', function(data) {
            _message = data.date + "|" + data.productcategoryname + "|" + data.productname + "|" + data.person + "|" + data.location;
            console.log('Message from server: ' + _message);

            that._firePropertiesChanged();

            this.settings = {};
            this.settings.sessionid = "";

            that.dispatchEvent(new CustomEvent("onStart", {
                detail: {
                    settings: this.settings
                }
            }));
        });


        //CAI Webchat
        //******************************************
        let content = document.createElement('div');
        content.slot = "content";
        that_.appendChild(content);

        var s = document.createElement("script");
        s.setAttribute("id", "cai-webclient-custom");
        s.setAttribute("src", "https://cdn.cai.tools.sap/webclient/bootstrap.js");
        if (document.body != null) {
            document.body.appendChild(s);
        }
        s.setAttribute("data-channel-id", that._export_settings.channelid);
        s.setAttribute("data-token", that._export_settings.token);
        s.setAttribute("data-expander-type", "CAI");
        s.setAttribute("data-expander-preferences", that._export_settings.preferences);
        that_.appendChild(s);

        that_._renderExportButton();
    }

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function loadScript(src, shadowRoot) {
        return new Promise(function(resolve, reject) {
            let script = document.createElement('script');
            script.src = src;

            script.onload = () => {
                console.log("Load: " + src);
                resolve(script);
            }
            script.onerror = () => reject(new Error(`Script load error for ${src}`));

            shadowRoot.appendChild(script)
        });
    }
})();
