import { Content, ContentManager } from "./content.js";
import { BossList, BossType, Difficulty, LootSlot, LootSlotType, LootSlots, parseDate } from "./data.js";
import { MainContent } from "./main-content.js";
import { SaveData } from "./save-data.js";

export class SummaryContent extends Content {
    getHtml(): string | Promise<string> | HTMLElement {
        let summaryContent = document.createElement('div');
        summaryContent.id = 'summary-content';
        let note = document.createElement('div');
        note.classList.add('summary-note');
        note.appendChild(document.createTextNode('Note: rows highlighted in '));
        let span = document.createElement('span');
        span.classList.add('red-text');
        span.appendChild(document.createTextNode('red'));
        note.appendChild(span);
        note.appendChild(document.createTextNode(' are not included in the totals.'));
        summaryContent.appendChild(note);

        let dateFilters = document.createElement('div');
        dateFilters.classList.add('date-filters');
        let label = document.createElement('label');
        label.appendChild(document.createTextNode('Start Date: '));
        label.htmlFor = 'start-date';
        dateFilters.appendChild(label);
        let dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.id = 'start-date';
        dateInput.onchange = this.recalculate.bind(this, summaryContent);
        dateFilters.appendChild(dateInput);
        label = document.createElement('label');
        label.htmlFor = 'end-date';
        label.appendChild(document.createTextNode('End Date: '));
        dateFilters.appendChild(label);
        dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.id = 'end-date';
        dateInput.onchange = this.recalculate.bind(this, summaryContent);
        dateFilters.appendChild(dateInput);
        summaryContent.appendChild(dateFilters);

        summaryContent.appendChild(this.getLootSlotCards());

        return summaryContent;
    }

    getLootSlotCards() {
        let startDate: Date | null = parseDate((document.getElementById('start-date') as HTMLInputElement)?.value);
        let endDate: Date | null = parseDate((document.getElementById('end-date') as HTMLInputElement)?.value);
        if (isNaN(startDate.getTime())) {
            startDate = null;
        }
        if (isNaN(endDate.getTime())) {
            endDate = null;
        }

        let lootSlotCards = document.createElement('div');
        lootSlotCards.id = 'loot-card-list';
        let lootSlotId: LootSlotType;
        for (lootSlotId in LootSlots) {
            let lootSlot: LootSlot = LootSlots[lootSlotId];
            let totalCount = 0;
            let totalWeight = 0;
            let lootSlotCard = document.createElement('div');
            lootSlotCard.classList.add('loot-card');

            let lootSlotTitle = document.createElement('div');
            lootSlotTitle.classList.add('loot-card-title');
            lootSlotTitle.appendChild(document.createTextNode(lootSlot.name));
            lootSlotCard.appendChild(lootSlotTitle);

            let lootSlotTable = document.createElement('table');
            lootSlotTable.classList.add('data-table');
            let thead = document.createElement('thead');
            let headerRow = document.createElement('tr');

            let headerCell = document.createElement('th');
            headerCell.appendChild(document.createTextNode('Boss'));
            headerRow.appendChild(headerCell);

            headerCell = document.createElement('th');
            headerCell.appendChild(document.createTextNode('Count'));
            headerRow.appendChild(headerCell);

            headerCell = document.createElement('th');
            headerCell.appendChild(document.createTextNode('Weight'));
            headerRow.appendChild(headerCell);

            headerCell = document.createElement('th');
            headerCell.appendChild(document.createTextNode('Rate'));
            headerRow.appendChild(headerCell);
            thead.appendChild(headerRow);
            lootSlotTable.appendChild(thead);

            let tbody = document.createElement('tbody');
            let bossId: BossType;
            for (bossId in BossList) {
                let difficulty: Difficulty;
                for (difficulty in BossList[bossId].difficulties) {
                    let lootInfo = BossList[bossId].difficulties[difficulty]!.loots[lootSlotId];
                    let history = SaveData.getHistory(bossId, difficulty);
                    if (startDate || endDate) {
                        history = history.createSubHistory(startDate, endDate);
                    }
                    if (lootInfo && history.entryCount() > 0 && (!lootInfo.removed || (!lootSlot.skipTotal && !lootInfo.excludeFromTotal))) {
                        let difficultyName = difficulty[0].toUpperCase() + difficulty.substring(1);
                        let count = history.getTotal(lootSlotId)!;
                        let weight = history.getTrialCount(lootSlotId)!;
                        let integerWeight = weight == Math.floor(weight);
                        let row = document.createElement('tr');
    
                        let cell = document.createElement('td');
                        cell.classList.add('boss-name');
                        let bossName = difficultyName + ' ' + BossList[bossId].name;
                        if (lootInfo.summaryClarifier) {
                            bossName += ' (' + lootInfo.summaryClarifier + ')';
                        }
                        cell.appendChild(document.createTextNode(bossName));
                        row.appendChild(cell);
    
                        cell = document.createElement('td');
                        cell.appendChild(document.createTextNode(count.toString()));
                        row.appendChild(cell);
    
                        cell = document.createElement('td');
                        cell.appendChild(document.createTextNode(integerWeight ? weight.toString() : weight.toFixed(2)));
                        row.appendChild(cell);
    
                        cell = document.createElement('td');
                        cell.appendChild(document.createTextNode((100 * count / weight).toFixed(2) + '%'));
                        row.appendChild(cell);

                        tbody.appendChild(row);
                        if (lootInfo.excludeFromTotal) {
                            row.classList.add('data-red');
                        } else {
                            totalCount += count;
                            totalWeight += weight;
                        }
                    }
                }
            }
            lootSlotTable.appendChild(tbody);

            if (!lootSlot.skipTotal) {
                let integerWeight = totalWeight == Math.floor(totalWeight);
                let tfoot = document.createElement('tfoot');
                let footerRow = document.createElement('tr');

                let footerCell = document.createElement('td');
                footerCell.classList.add('boss-name');
                footerCell.appendChild(document.createTextNode('Total'));
                footerRow.appendChild(footerCell);

                footerCell = document.createElement('td');
                footerCell.appendChild(document.createTextNode(totalCount.toString()));
                footerRow.appendChild(footerCell);
    
                footerCell = document.createElement('td');
                footerCell.appendChild(document.createTextNode(integerWeight ? totalWeight.toString() : totalWeight.toFixed(2)));
                footerRow.appendChild(footerCell);

                footerCell = document.createElement('td');
                footerRow.appendChild(footerCell);
                footerCell.appendChild(document.createTextNode((100 * totalCount / totalWeight).toFixed(2) + '%'));

                tfoot.appendChild(footerRow);
                lootSlotTable.appendChild(tfoot);
            }

            lootSlotCard.appendChild(lootSlotTable);
            lootSlotCards.appendChild(lootSlotCard);
        }
        return lootSlotCards;
    }

    recalculate(content: HTMLElement): void {
        let lootSlotCards = document.getElementById('loot-card-list');
        if (lootSlotCards) {
            content.removeChild(lootSlotCards);
        }
        content.appendChild(this.getLootSlotCards());
    }

    getFooter(): string | Promise<string> | HTMLElement {
        return ContentManager.readHtml('summary-content-footer.html');
    }

    init(): void | Promise<void> {
        (document.querySelector('.back-button') as HTMLElement).onclick = () => {
            ContentManager.changeContent(new MainContent());
        }
    }
}