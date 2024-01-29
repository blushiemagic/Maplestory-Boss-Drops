const settingsPath: string = './settings.json';

export const Settings = {
    async getAll(): Promise<any> {
        try {
            await Neutralino.filesystem.getStats(settingsPath);
        } catch {
            return {};
        }
        return JSON.parse(await Neutralino.filesystem.readFile(settingsPath));
    },

    async get(key: string): Promise<any> {
        let json = await this.getAll();
        let keys = key.split('.');
        for (var subkey of keys) {
            if (!(subkey in json)) {
                return undefined;
            }
            json = json[subkey];
        }
        return json;
    },

    async setAll(settings: any) {
        await Neutralino.filesystem.writeFile(settingsPath, JSON.stringify(settings, null, 4));
    },

    async set(key: string, value: any): Promise<void> {
        let settings = await this.getAll();
        let keys = key.split('.');
        let json = settings;
        for (var k = 0; k < keys.length - 1; k++) {
            let subkey = keys[k];
            if (!(subkey in json)) {
                json[subkey] = {};
            }
            json = json[subkey];
        }
        json[keys[keys.length - 1]] = value;
        await this.setAll(settings);
    }
} as const;
