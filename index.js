const { Plugin } = require('powercord/entities');
const fs = require('fs');

module.exports = class Share extends Plugin {
    async startPlugin() {
        powercord.api.commands.registerCommand({
            command: 'share plugin',
            usage: '{c} [plugin name]',
            description: 'Share a plugin you have in the chat',
            executor: this.share.bind(this),
            autocomplete: this.autocomplete.bind(this),
        });
    }

    pluginWillUnload() {
        powercord.api.commands.unregisterCommand('plugin');
    }

    share([id]) {
        if (powercord.pluginManager.plugins.has(id)) {
            const plugin = powercord.pluginManager.plugins.get(id);
            try {
                fs.readFile(plugin.entityPath + '\\.git\\config', 'utf8', (err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        data = data.split('\n').map(e => e.trim())
                        let url=""
                        for (var i=0;i<data.length;i++) {
                            if (data[i].startsWith("url = ")) {
                                url = data[i].replace(".git", "").replace("url = ", "");
                                break;
                            }
                        }
                        if (url !== "") {
                            console.log(url)
                            return { send: true, result: url }
                        } else {
                            return { result: "Unable to find a url in the .git config file."}
                        }
                    }
                })
            } catch (err) {
                return { result: "There isn't a .git folder for this plugin." }
            }
        }
    }

    autocomplete([findId, ...args]) {
        if (args.length) {
            return false;
        }
        return {
            commands: [...powercord.pluginManager.plugins]
            .filter(([id]) => id.includes(findId))
            .map(([id]) => ({ command: id })),
            header: 'plugins list',
        };
    }
}