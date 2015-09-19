YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "bootstrap",
        "components.Component.Component",
        "components.Geolocation.Geolocation",
        "components.Spinner.Spinner",
        "main",
        "services.geolocation.geolocation"
    ],
    "modules": [
        "src_app"
    ],
    "allModules": [
        {
            "displayName": "src/app",
            "name": "src_app",
            "description": "This is the entry point of the whole application.\n\nExample:\n\n```\nSystem.import('app/bootstrap.js').catch(console.error.bind(console));\n```"
        }
    ],
    "elements": []
} };
});