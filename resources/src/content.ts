export abstract class Content {
    abstract getHtml(): string | Promise<string> | HTMLElement;

    abstract getFooter(): string | Promise<string> | HTMLElement;

    init(): void | Promise<void> { }

    canExit(): boolean {
        return true;
    }
}

const cacheEnabled: boolean = true;

let currentContent: Content | null = null;
let cache: Map<string, string> = new Map<string, string>();

export const ContentManager = {
    async changeContent(content: Content): Promise<void> {
        currentContent = content;
        let html = await content.getHtml();
        let footerHtml = await content.getFooter();

        let container = document.getElementById('container');
        if (container) {
            if (typeof html == 'string') {
                container.innerHTML = html;
            } else {
                container.innerHTML = '';
                container.appendChild(html);
            }
        }

        let footer = document.getElementById('footer');
        if (footer) {
            if (typeof footerHtml == 'string') {
                footer.innerHTML = footerHtml;
            } else {
                footer.innerHTML = '';
                footer.appendChild(footerHtml);
            }
        }

        content.init();
    },

    async readHtml(filename: string): Promise<string> {
        if (cacheEnabled && cache.has(filename)) {
            return cache.get(filename)!;
        }
        var response = await fetch(filename);
        let text = await response.text();
        if (cacheEnabled) {
            cache.set(filename, text);
        }
        return text;
    },

    canExit(): boolean {
        return currentContent?.canExit() ?? true;
    }
}
