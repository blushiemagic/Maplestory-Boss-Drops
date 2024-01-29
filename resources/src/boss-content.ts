import { Content, ContentManager } from './content.js';
import { BossList, BossType, Difficulty, LootSlots, dateToString } from './data.js';
import { MainContent } from './main-content.js';
import { LootEntry, SaveData } from './save-data.js';

export class BossContent extends Content {
    private boss: BossType;
    private difficulty: Difficulty;

    private editingRow: number = -1;

    constructor(boss: BossType, difficulty: Difficulty) {
        super();
        this.boss = boss;
        this.difficulty = difficulty;
    }

    getHtml(): string | Promise<string> | HTMLElement {
        let history = SaveData.getHistory(this.boss, this.difficulty);
        let columns: string[] = ['#', 'Date', 'Clear Size'];
        for (let lootSlot of history.getLootSlots()) {
            let nameOverride = BossList[this.boss].loots[this.difficulty]![lootSlot]!.nameOverride;
            columns.push(nameOverride ?? LootSlots[lootSlot].name);
        }
        columns.push('Droprate', 'Greed', 'Personal Drop', 'Personal Greed', 'Notes', '');
        let bossContent = document.createElement('div');
        bossContent.id = 'boss-content';

        let table = document.createElement('table');
        table.classList.add('data-table');
        table.classList.add('data-table-sticky');
        let header = document.createElement('thead');
        let headerRow = document.createElement('tr');
        for (let column of columns) {
            let headerCell = document.createElement('th');
            headerCell.appendChild(document.createTextNode(column));
            headerRow.appendChild(headerCell);
        }
        header.appendChild(headerRow);
        table.appendChild(header);

        let body = document.createElement('tbody');
        let count: number = 0;
        for (let entry of history.getEntries()) {
            count++;
            body.appendChild(this.createDisplayRow(count, entry));
        }
        table.appendChild(body);

        let footer = document.createElement('tfoot');
        let footerRow = document.createElement('tr');
        for (let column of columns) {
            let footerCell = document.createElement('th');
            footerCell.appendChild(document.createTextNode(column));
            footerRow.appendChild(footerCell);
        }
        footer.appendChild(footerRow);
        footerRow = document.createElement('tr');
        for (let column of columns) {
            let footerCell = document.createElement('td');
            if (column == 'Date') {
                footerCell.appendChild(document.createTextNode('Total'));
            }
            footerRow.appendChild(footerCell);
        }
        footer.appendChild(footerRow);
        footerRow = document.createElement('tr');
        for (let column of columns) {
            let footerCell = document.createElement('td');
            if (column == 'Date') {
                footerCell.appendChild(document.createTextNode('Rates'));
            }
            footerRow.appendChild(footerCell);
        }
        footer.appendChild(footerRow);
        table.appendChild(footer);
        bossContent.appendChild(table);
        this.refreshTotals(footer);

        let addRowButton = document.createElement('button');
        addRowButton.id = 'add-row';
        addRowButton.type = 'button';
        addRowButton.onclick = this.addRow.bind(this);
        addRowButton.appendChild(document.createTextNode('Add Row'));
        bossContent.appendChild(addRowButton);

        return bossContent;
    }

    private createDisplayRow(count: number, entry: LootEntry): HTMLTableRowElement {
        let history = SaveData.getHistory(this.boss, this.difficulty);
        let row = document.createElement('tr');

        this.addCellToRow(row, count.toString());
        let month = entry.date.getUTCMonth() + 1;
        let date = entry.date.getUTCDate();
        let year = entry.date.getUTCFullYear();
        this.addCellToRow(row, month + '/' + date + '/' + year);
        this.addCellToRow(row, entry.clearSize.toString());
        for (let lootSlot of history.getLootSlots()) {
            this.addCellToRow(row, entry[lootSlot]!.toString());
        }
        this.addCellToRow(row, entry.drop.toString());
        this.addCellToRow(row, entry.greed.toString());
        this.addCellToRow(row, entry.personalDrop.toString());
        this.addCellToRow(row, entry.personalGreed.toString());
        this.addCellToRow(row, entry.notes);

        let cell = document.createElement('td');
        let container = document.createElement('div');
        container.classList.add('flex-row');
        let button = document.createElement('button');
        button.type = 'button';
        button.classList.add('icon-button');
        let img = document.createElement('img');
        img.src = 'assets/control/edit.png';
        button.appendChild(img);
        button.ariaLabel = 'Edit';
        button.title = 'Edit';
        button.onclick = this.makeEditRow(count - 1);
        container.appendChild(button);
        button = document.createElement('button');
        button.type = 'button';
        button.classList.add('icon-button');
        button.classList.add('warning');
        img = document.createElement('img');
        img.src = 'assets/control/delete.png';
        button.appendChild(img);
        button.ariaLabel = 'Delete';
        button.title = 'Delete';
        button.onclick = this.makeDeleteRow(count - 1);
        container.appendChild(button);
        cell.appendChild(container);
        row.appendChild(cell);

        return row;
    }

    private refreshTotals(tableFooter?: Element | null): void {
        tableFooter = tableFooter ?? document.querySelector('.data-table tfoot');
        if (tableFooter == null) {
            throw Error('Table has no tfoot element');
        }
        let totalsRow = tableFooter.children[1];
        let ratesRow = tableFooter.children[2];
        let history = SaveData.getHistory(this.boss, this.difficulty);
        
        totalsRow.children[0].innerHTML = history.entryCount().toString();
        totalsRow.children[2].innerHTML = history.getTrialCount('clears')!.toString();
        let index = 3;
        for (let lootSlot of history.getLootSlots()) {
            let total = history.getTotal(lootSlot)!;
            let trials = history.getTrialCount(lootSlot)!;
            totalsRow.children[index].innerHTML = total.toString();
            ratesRow.children[index].innerHTML = (100 * total / trials).toFixed(2) + '%';
            index++;
        }
        totalsRow.children[index].innerHTML = history.getTrialCount('drop')!.toFixed(2);
        totalsRow.children[index + 1].innerHTML = history.getTrialCount('equip')!.toFixed(2);
        totalsRow.children[index + 2].innerHTML = history.getTrialCount('personal')!.toFixed(2);
        totalsRow.children[index + 3].innerHTML = history.getTrialCount('personal_equip')!.toFixed(2);
    }

    private addCellToRow(row: HTMLTableRowElement, content: string): void {
        let cell = document.createElement('td');
        cell.appendChild(document.createTextNode(content));
        row.appendChild(cell);
    }

    private makeEditRow(index: number): (ev: Event) => void {
        return () => {
            if (this.editingRow >= 0) {
                return;
            }
            let tableBody = document.querySelector('.data-table tbody');
            if (tableBody == null) {
                throw Error('Table has no tbody element');
            }
            if (index >= tableBody.childElementCount) {
                return;
            }
            let history = SaveData.getHistory(this.boss, this.difficulty);

            this.editingRow = index;
            let editRow = this.createEditRow(index + 1, history.getEntry(index));
            tableBody.replaceChild(editRow, tableBody.children[index]);
            this.lockControls();
        };
    }

    private makeDeleteRow(index: number): (ev: Event) => Promise<void> {
        return async () => {
            if (this.editingRow >= 0) {
                return;
            }
            let tableBody = document.querySelector('.data-table tbody');
            if (tableBody == null) {
                throw Error('Table has no tbody element');
            }
            if (index >= tableBody.childElementCount) {
                return;
            }
            if (window.confirm('Are you sure you would like to delete this row? This action cannot be undone.')) {
                let history = SaveData.getHistory(this.boss, this.difficulty);
                history.removeEntry(index);
                this.lockControls();
                await SaveData.save();
                tableBody.removeChild(tableBody.children[index]);
                for (let k = index; k < tableBody.childElementCount; k++) {
                    let row = tableBody.children[k];
                    row.firstElementChild!.innerHTML = (k + 1).toString();
                    let controls = row.lastElementChild!.firstElementChild!;
                    (controls.firstElementChild as HTMLButtonElement).onclick = this.makeEditRow(k);
                    (controls.lastElementChild as HTMLButtonElement).onclick = this.makeDeleteRow(k);
                }
                this.unlockControls();
                this.refreshTotals();
            }
        };
    }

    private addRow() {
        if (this.editingRow >= 0) {
            return;
        }
        let tableBody = document.querySelector('.data-table tbody');
        if (tableBody == null) {
            throw Error('Table has no tbody element');
        }

        this.editingRow = tableBody.childElementCount;
        tableBody.appendChild(this.createEditRow(this.editingRow + 1));
        this.lockControls();
        this.scrollToBottom();
    }

    private createEditRow(count: number, entry?: LootEntry): HTMLTableRowElement {
        let history = SaveData.getHistory(this.boss, this.difficulty);
        let row = document.createElement('tr');
        row.role = 'form';
        row.ariaLabel = 'Edit Row';

        this.addCellToRow(row, count.toString());

        let inputCell = document.createElement('td');
        let input = document.createElement('input');
        input.type = 'date';
        input.name = 'date';
        if (entry) {
            input.valueAsDate = entry.date;
        } else {
            let now = new Date();
            input.valueAsDate = now;
        }
        inputCell.appendChild(input);
        input.onclick = (ev: Event) => ev.stopImmediatePropagation();
        inputCell.onclick = this.makeFocus(input);
        row.appendChild(inputCell);

        inputCell = document.createElement('td');
        input = document.createElement('input');
        input.type = 'number';
        input.name = 'clearSize';
        input.classList.add('small-number')
        input.min = '1';
        input.max = '6';
        input.valueAsNumber = entry ? entry.clearSize : 1;
        inputCell.appendChild(input);
        input.onclick = (ev: Event) => ev.preventDefault();
        inputCell.onclick = this.makeFocus(input);
        row.appendChild(inputCell);

        for (let lootSlot of history.getLootSlots()) {
            inputCell = document.createElement('td');
            input = document.createElement('input');
            if (entry && entry[lootSlot] === undefined) {
                throw Error('Entry does not match table columns');
            }
            input.name = lootSlot;
            if (LootSlots[lootSlot].instanced && LootSlots[lootSlot].ignoreDroprate) {
                input.type = 'number';
                input.min = '0';
                input.max = '6';
                input.classList.add('small-number');
                input.valueAsNumber = entry ? entry[lootSlot]! : 0;
                input.onclick = (ev: Event) => ev.preventDefault();
                inputCell.onclick = this.makeFocus(input);
            } else {
                input.type = 'checkbox';
                input.checked = entry ? (entry[lootSlot]! > 0) : false;
                input.value = '1';
                input.onclick = (ev: Event) => ev.stopImmediatePropagation();
                inputCell.onclick = this.makeToggleCheck(input);
            }
            inputCell.appendChild(input);
            row.appendChild(inputCell);
        }

        inputCell = document.createElement('td');
        input = document.createElement('input');
        input.type = 'number';
        input.name = 'drop';
        input.min = '0';
        input.valueAsNumber = entry ? entry.drop : 0;
        inputCell.appendChild(input);
        input.onclick = (ev: Event) => ev.preventDefault();
        inputCell.onclick = this.makeFocus(input);
        row.appendChild(inputCell);

        inputCell = document.createElement('td');
        input = document.createElement('input');
        input.type = 'number';
        input.name = 'greed';
        input.min = '0';
        input.valueAsNumber = entry ? entry.greed : 0;
        inputCell.appendChild(input);
        input.onclick = (ev: Event) => ev.preventDefault();
        inputCell.onclick = this.makeFocus(input);
        row.appendChild(inputCell);

        inputCell = document.createElement('td');
        input = document.createElement('input');
        input.type = 'number';
        input.name = 'personalDrop';
        input.min = '0';
        input.valueAsNumber = entry ? entry.personalDrop : 0;
        inputCell.appendChild(input);
        input.onclick = (ev: Event) => ev.preventDefault();
        inputCell.onclick = this.makeFocus(input);
        row.appendChild(inputCell);

        inputCell = document.createElement('td');
        input = document.createElement('input');
        input.type = 'number';
        input.name = 'personalGreed';
        input.min = '0';
        input.valueAsNumber = entry ? entry.personalGreed : 0;
        inputCell.appendChild(input);
        input.onclick = (ev: Event) => ev.preventDefault();
        inputCell.onclick = this.makeFocus(input);
        row.appendChild(inputCell);

        inputCell = document.createElement('td');
        input = document.createElement('input');
        input.type = 'text';
        input.name = 'notes';
        input.autocomplete = 'off';
        if (entry) {
            input.value = entry.notes;
        }
        inputCell.appendChild(input);
        input.onclick = (ev: Event) => ev.preventDefault();
        inputCell.onclick = this.makeFocus(input);
        row.appendChild(inputCell);

        inputCell = document.createElement('td');
        let container = document.createElement('div');
        container.classList.add('flex-row');
        let button = document.createElement('button');
        button.type = 'submit';
        button.classList.add('icon-button');
        let img = document.createElement('img');
        img.src = 'assets/control/save.png';
        button.appendChild(img);
        button.ariaLabel = 'Save (Enter)';
        button.title = 'Save (Enter)';
        button.onclick = this.saveRow.bind(this);
        container.appendChild(button);
        button = document.createElement('button');
        button.type = 'button';
        button.classList.add('icon-button');
        button.classList.add('warning');
        img = document.createElement('img');
        img.src = 'assets/control/cancel.png';
        button.appendChild(img);
        button.ariaLabel = 'Cancel';
        button.title = 'Cancel';
        button.onclick = this.cancelEditRow.bind(this);
        container.appendChild(button);
        inputCell.appendChild(container);
        row.appendChild(inputCell);

        row.onkeydown = (ev: KeyboardEvent) => {
            if (ev.key == 'Enter') {
                this.saveRow();
            }
        };

        return row;
    }

    private async saveRow() {
        if (this.editingRow < 0) {
            return;
        }
        let tbody = document.querySelector('.data-table tbody');
        if (tbody == null) {
            throw Error('Table has no tbody element');
        }
        let editRow = tbody.children[this.editingRow];
        let history = SaveData.getHistory(this.boss, this.difficulty);
        let newEntry;
        try {
            newEntry = this.makeLootEntryFromEditRow();
        } catch (err) {
            window.alert(err);
            return;
        }

        if (this.editingRow == history.entryCount()) {
            history.addEntry(newEntry);
        } else {
            history.setEntry(this.editingRow, newEntry);
        }
        for (let input of editRow.querySelectorAll('input')) {
            input.disabled = true;
        }
        for (let button of editRow.querySelectorAll('button')) {
            button.disabled = true;
        }
        await SaveData.save();
        let newRow = this.createDisplayRow(this.editingRow + 1, newEntry);
        tbody.replaceChild(newRow, editRow);
        this.editingRow = -1;
        this.unlockControls();
        this.refreshTotals();
    }

    private cancelEditRow(): void {
        if (this.editingRow < 0) {
            return;
        }
        let tbody = document.querySelector('.data-table tbody');
        if (tbody == null) {
            throw Error('Table has no tbody element');
        }
        let history = SaveData.getHistory(this.boss, this.difficulty);

        if (this.editingRow == history.entryCount()) {
            tbody.removeChild(tbody.children[this.editingRow]);
        } else {
            let originalRow = this.createDisplayRow(this.editingRow + 1, history.getEntry(this.editingRow));
            tbody.replaceChild(originalRow, tbody.children[this.editingRow]);
        }
        this.editingRow = -1;
        this.unlockControls();
    }

    private makeLootEntryFromEditRow(): LootEntry {
        if (this.editingRow < 0) {
            throw Error('Cannot create loot entry without edit row');
        }
        let row = document.querySelector('.data-table tbody')!.children[this.editingRow];
        let history = SaveData.getHistory(this.boss, this.difficulty);

        let date = this.getInputChildByName(row, 'date')!.valueAsDate;
        if (date == null || isNaN(date.getTime())) {
            throw Error('Must input valid date');
        }

        let entry: LootEntry = {
            date: date,
            clearSize: this.getInputChildByName(row, 'clearSize')!.valueAsNumber,
            drop: this.getInputChildByName(row, 'drop')!.valueAsNumber,
            greed: this.getInputChildByName(row, 'greed')!.valueAsNumber,
            personalDrop: this.getInputChildByName(row, 'personalDrop')!.valueAsNumber,
            personalGreed: this.getInputChildByName(row, 'personalGreed')!.valueAsNumber,
            notes: this.getInputChildByName(row, 'notes')!.value,
            unknown: {}
        };

        for (let lootSlot of history.getLootSlots()) {
            let input = this.getInputChildByName(row, lootSlot)!;
            if (input.type == 'number') {
                entry[lootSlot] = input.valueAsNumber;
            } else if (input.type == 'checkbox') {
                entry[lootSlot] = input.checked ? 1 : 0;
            } else {
                throw Error('Unknown input type appeared');
            }
        }
        return entry;
    }

    private makeFocus(element: HTMLInputElement): (ev: Event) => void {
        return () => {
            element.focus();
            element.select();
        };
    }

    private makeToggleCheck(element: HTMLInputElement): (ev: Event) => void {
        return () => {
            element.focus();
            element.checked = !element.checked;
        }
    }

    private getInputChildByName(element: Element, name: string): HTMLInputElement | null {
        return element.querySelector<HTMLInputElement>(`input[name="${name}"]`)
    }

    private lockControls() {
        (document.getElementById('add-row') as HTMLButtonElement).disabled = true;
        let tableBody = document.querySelector('.data-table tbody');
        if (tableBody == null) {
            throw Error('Table has no tbody element');
        }
        for (let k = 0; k < tableBody.childElementCount; k++) {
            if (k == this.editingRow) {
                continue;
            }
            for (let button of tableBody.children[k].querySelectorAll('button')) {
                button.disabled = true;
            }
        }
    }

    private unlockControls() {
        (document.getElementById('add-row') as HTMLButtonElement).disabled = false;
        let tableBody = document.querySelector('.data-table tbody');
        if (tableBody == null) {
            throw Error('Table has no tbody element');
        }
        for (let row of tableBody.children) {
            for (let button of row.querySelectorAll('button')) {
                button.disabled = false;
            }
        }
    }

    getFooter(): string | Promise<string> | HTMLElement {
        let container = document.createElement('div');

        let button = document.createElement('button');
        button.type = 'button';
        button.classList.add('back-button');
        button.appendChild(document.createTextNode('Back'));
        button.onclick = () => {
            if (this.editingRow < 0 || window.confirm('You still have unsaved changes. Are you sure you would like to go back?')) {
                ContentManager.changeContent(new MainContent());
            }
        };
        container.appendChild(button);

        let difficultyIcon = document.createElement('span');
        difficultyIcon.classList.add('difficulty');
        difficultyIcon.classList.add(this.difficulty);
        difficultyIcon.appendChild(document.createTextNode(this.difficulty.toUpperCase()));
        container.appendChild(difficultyIcon);

        let bossImageContainer = document.createElement('span');
        bossImageContainer.classList.add('boss-name');
        let bossImage = document.createElement('img');
        bossImage.src = 'assets/boss/' + this.boss + '.png';
        bossImageContainer.appendChild(bossImage);
        let bossName = document.createElement('span');
        bossName.appendChild(document.createTextNode(BossList[this.boss].name));
        bossImageContainer.appendChild(bossName);
        container.appendChild(bossImageContainer);

        return container;
    }

    init(): void | Promise<void> {
        this.scrollToBottom();
    }

    private scrollToBottom(): void {
        let table = document.querySelector('.data-table');
        if (table == null) {
            throw Error('No table exists');
        }
        table.scrollTop = table.scrollHeight - table.clientHeight;
    }

    canExit(): boolean {
        return this.editingRow < 0 || window.confirm('You still have unsaved changes. Are you sure you would like to exit?');
    }
}