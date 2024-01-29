import { ContentManager } from "./content.js";
import { MainContent } from './main-content.js';
import { SaveData } from "./save-data.js";

Neutralino.init();

function onWindowClose(): void {
    if (ContentManager.canExit()) {
        Neutralino.app.exit();
    }
}

Neutralino.events.on('windowClose', onWindowClose);

SaveData.init()
    .then(() => ContentManager.changeContent(new MainContent()));
