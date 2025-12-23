import {
    BossList,
    BossType,
    Data,
    Difficulty,
    LootInfo,
    LootSlots,
    LootSlotType,
    ModifierName,
    Modifiers,
    ReleaseDates,
    dateToString,
    getMaxDroprate,
    parseDate
} from "./data.js";
import { Settings } from "./settings.js";

export interface LootEntry extends Partial<Record<LootSlotType, number>> {
    date: Date;
    clearSize: number;
    drop: number;
    greed: number;
    personalDrop: number;
    personalGreed: number;
    notes: string;
    unknown: Readonly<Record<string, string>>;
}

const maxDrop: number[] = [ 400, 500 ];

type TrialType = 'clears' | 'drop' | 'equip' | 'personal' | 'personal_equip' | LootSlotType;

export class LootHistory {
    private lootSlots: Data<LootSlotType, LootInfo>;
    private unknown: Set<string> | null = null;
    private entries: Readonly<LootEntry>[] = [];
    private invalidEntries: string[] = [];

    private lootTotals: Map<LootSlotType, number> = new Map();
    private trials: Map<TrialType, number> = new Map();

    constructor(lootSlots: Data<LootSlotType, LootInfo>) {
        this.lootSlots = lootSlots;
        this.trials.set('clears', 0);
        this.trials.set('drop', 0);
        this.trials.set('equip', 0);
        this.trials.set('personal', 0);
        this.trials.set('personal_equip', 0);
        for (let lootSlot of this.getLootSlots()) {
            this.lootTotals.set(lootSlot, 0);
            if (this.lootSlotNeedsTrial(lootSlot)) {
                this.trials.set(lootSlot, 0);
            }
        }
    }

    getLootSlots(): Iterable<LootSlotType> {
        return Object.keys(this.lootSlots) as LootSlotType[];
    }

    hasLootSlot(column: string): boolean {
        return this.lootSlots.hasOwnProperty(column);
    }

    *getEntries() {
        let count = 0;
        for (let entry of this.entries) {
            yield entry;
            count++;
        }
        return count;
    }

    entryCount(): number {
        return this.entries.length;
    }

    getEntry(index: number): Readonly<LootEntry> {
        return this.entries[index];
    }

    setEntry(index: number, entry: LootEntry): boolean {
        if (!this.validateEntry(entry)) {
            return false;
        }
        this.removeEntryFromTotals(index);
        this.entries[index] = Object.freeze(entry);
        this.addEntryToTotals(entry);
        return true;
    }

    addEntry(entry: LootEntry): boolean {
        if (!this.validateEntry(entry)) {
            return false;
        }
        this.entries.push(Object.freeze(entry));
        this.addEntryToTotals(entry);
        return true;
    }

    removeEntry(index: number): void {
        this.removeEntryFromTotals(index);
        this.entries.splice(index, 1);
    }

    private addEntryToTotals(entry: LootEntry): void {
        let maxDrop = getMaxDroprate(entry.date);
        let drop = 1 + Math.min(entry.drop, maxDrop) / 100;
        let equip = 1 + Math.min(entry.drop + entry.greed, maxDrop) / 100;
        let personal = 1 + Math.min(entry.personalDrop, maxDrop) / 100;
        let personalEquip = 1 + Math.min(entry.personalDrop + entry.personalGreed, maxDrop) / 100;

        this.trials.set('clears', this.trials.get('clears')! + entry.clearSize);
        this.trials.set('drop', this.trials.get('drop')! + drop);
        this.trials.set('equip', this.trials.get('equip')! + equip);
        this.trials.set('personal', this.trials.get('personal')! + personal);
        this.trials.set('personal_equip', this.trials.get('personal_equip')! + personalEquip);

        for (let lootSlot of this.getLootSlots()) {
            this.lootTotals.set(lootSlot, this.lootTotals.get(lootSlot)! + entry[lootSlot]!);
            if (this.isLootSlotTrial(lootSlot, entry.date)) {
                let value: number;
                if (LootSlots[lootSlot].instanced) {
                    if (LootSlots[lootSlot].ignoreDroprate) {
                        value = entry.clearSize;
                    } else if (LootSlots[lootSlot].equip && !this.lootSlots[lootSlot]!.noEquip) {
                        value = personalEquip;
                    } else {
                        value = personal;
                    }
                } else {
                    if (LootSlots[lootSlot].ignoreDroprate) {
                        value = 1;
                    } else if (LootSlots[lootSlot].equip && !this.lootSlots[lootSlot]!.noEquip) {
                        value = equip;
                    } else {
                        value = drop;
                    }
                }
                value *= this.getLootSlotModifier(lootSlot, entry.date);
                this.trials.set(lootSlot, this.trials.get(lootSlot)! + value);
            }
        }
    }

    private removeEntryFromTotals(index: number): void {
        let entry: LootEntry = this.entries[index];
        let maxDrop = getMaxDroprate(entry.date);
        let drop = 1 + Math.min(entry.drop, maxDrop) / 100;
        let equip = 1 + Math.min(entry.drop + entry.greed, maxDrop) / 100;
        let personal = 1 + Math.min(entry.personalDrop, maxDrop) / 100;
        let personalEquip = 1 + Math.min(entry.personalDrop + entry.personalGreed, maxDrop) / 100;

        this.trials.set('clears', this.trials.get('clears')! - entry.clearSize);
        this.trials.set('drop', this.trials.get('drop')! - drop);
        this.trials.set('equip', this.trials.get('equip')! - equip);
        this.trials.set('personal', this.trials.get('personal')! - personal);
        this.trials.set('personal_equip', this.trials.get('personal_equip')! - personalEquip);

        for (let lootSlot of this.getLootSlots()) {
            this.lootTotals.set(lootSlot, this.lootTotals.get(lootSlot)! - entry[lootSlot]!);
            if (this.isLootSlotTrial(lootSlot, entry.date)) {
                let value: number;
                if (LootSlots[lootSlot].instanced) {
                    if (LootSlots[lootSlot].ignoreDroprate) {
                        value = entry.clearSize;
                    } else if (LootSlots[lootSlot].equip && !this.lootSlots[lootSlot]!.noEquip) {
                        value = personalEquip;
                    } else {
                        value = personal;
                    }
                } else {
                    if (LootSlots[lootSlot].ignoreDroprate) {
                        value = 1;
                    } else if (LootSlots[lootSlot].equip && !this.lootSlots[lootSlot]!.noEquip) {
                        value = equip;
                    } else {
                        value = drop;
                    }
                }
                value *= this.getLootSlotModifier(lootSlot, entry.date);
                this.trials.set(lootSlot, this.trials.get(lootSlot)! - value);
            }
        }
    }

    private lootSlotNeedsTrial(lootSlot: LootSlotType): boolean {
        let modifierName: ModifierName;
        for (modifierName in Modifiers) {
            if (Modifiers[modifierName].lootSlots.has(lootSlot)) {
                return true;
            }
        }
        let releaseDate = this.lootSlots[lootSlot]!.releaseDateOverride ?? LootSlots[lootSlot].releaseDate;
        let removeDate = this.lootSlots[lootSlot]!.removed;
        return (releaseDate || removeDate) != undefined;
    }

    private isLootSlotTrial(lootSlot: LootSlotType, date: Date): boolean {
        if (!this.lootSlotNeedsTrial(lootSlot)) {
            return false;
        }
        let releaseDate = this.lootSlots[lootSlot]!.releaseDateOverride ?? LootSlots[lootSlot].releaseDate;
        let removeDate = this.lootSlots[lootSlot]!.removed;
        let unreleased = releaseDate && date < ReleaseDates[releaseDate];
        let removed = removeDate && date >= ReleaseDates[removeDate];
        return !unreleased && !removed;
    }

    private getLootSlotModifier(lootSlot: LootSlotType, date: Date): number {
        let multiplier = 1;
        let modifierName: ModifierName;
        for (modifierName in Modifiers) {
            let modifier = Modifiers[modifierName];
            if (modifier.lootSlots.has(lootSlot) &&
                (!modifier.startDate || date >= modifier.startDate) &&
                (!modifier.endDate || date < modifier.endDate)
            ) {
                multiplier *= modifier.multiplier;
            }
        }
        return multiplier;
    }

    private validateEntry(entry: LootEntry): boolean {
        for (let lootSlot of this.getLootSlots()) {
            if (!entry.hasOwnProperty(lootSlot)) {
                return false;
            }
        }
        return true;
    }

    getTotal(lootSlot: LootSlotType): number | undefined {
        return this.lootTotals.get(lootSlot);
    }

    getTrialCount(trialType: TrialType): number | undefined {
        if (this.trials.has(trialType)) {
            return this.trials.get(trialType);
        } else if (!this.lootSlots.hasOwnProperty(trialType)) {
            return undefined;
        } else {
            let lootSlot = trialType as LootSlotType;
            let lootInfo = this.lootSlots[lootSlot]!;
            if (LootSlots[lootSlot].instanced) {
                if (LootSlots[lootSlot].ignoreDroprate) {
                    return this.trials.get('clears');
                } else if (LootSlots[lootSlot].equip && !lootInfo.noEquip) {
                    return this.trials.get('personal_equip');
                } else {
                    return this.trials.get('personal');
                }
            } else {
                if (LootSlots[lootSlot].ignoreDroprate) {
                    return this.entryCount();
                } else if (LootSlots[lootSlot].equip && !lootInfo.noEquip) {
                    return this.trials.get('equip');
                } else {
                    return this.trials.get('drop');
                }
            }
        }
    }

    getUnknown(): Iterable<string> {
        return this.unknown ?? new Set<string>();
    }

    setUnknown(unknown: Iterable<string>): boolean {
        if (this.unknown != null) {
            return false;
        }
        this.unknown = new Set<string>(unknown);
        return true;
    }

    addInvalidEntry(entry: string) {
        this.invalidEntries.push(entry);
    }

    getInvalidEntries(): Iterable<string> {
        return this.invalidEntries;
    }

    createSubHistory(start: Date | null, end: Date | null) {
        let sub = new LootHistory(this.lootSlots);
        for (let entry of this.getEntries()) {
            if ((start == null || entry.date >= start) && (end == null || entry.date < end)) {
                sub.addEntry(entry);
            }
        }
        return sub;
    }
}

function makeNewHistories(): Readonly<Record<BossType, Data<Difficulty, LootHistory>>> {
    let newHistories: Partial<Record<BossType, Partial<Record<Difficulty, LootHistory>>>> = {};
    let bossType: BossType;
    for (bossType in BossList) {
        let bossHistories: Partial<Record<Difficulty, LootHistory>> = {};
        let difficulty: Difficulty;
        for (difficulty in BossList[bossType].difficulties) {
            let loots: Data<LootSlotType, LootInfo> = BossList[bossType].difficulties[difficulty]!.loots;
            bossHistories[difficulty] = new LootHistory(loots);
        }
        newHistories[bossType] = Object.freeze(bossHistories);
    }
    return Object.freeze(newHistories as Record<BossType, Data<Difficulty, LootHistory>>);
}

const defaultPath = 'drops.mcsv';
let path: string | null = null;
let histories: Readonly<Record<BossType, Data<Difficulty, LootHistory>>> = makeNewHistories();
let invalidTables: string[] = [];

async function fileExists(testPath: string) {
    try {
        await Neutralino.filesystem.getStats(testPath);
        return true;
    } catch {
        return false;
    }
}

function forceStringClone(value: string): string {
    return (' ' + value).slice(1);
}

async function setPath(setPath: string) {
    path = setPath;
    await Settings.set('save', path);
}

async function init(): Promise<void> {
    let settingsPath = await Settings.get('save');
    if (typeof(settingsPath) != 'string') {
        settingsPath = defaultPath;
    }

    if (await fileExists(settingsPath)) {
        await load(settingsPath);
    } else {
        await createNew(settingsPath);
    }
}

async function createNew(newPath: string): Promise<void> {
    setPath(newPath);
    histories = makeNewHistories();
    invalidTables = [];
    await save();
}

async function load(loadPath: string): Promise<void> {
    setPath(loadPath);
    histories = makeNewHistories();
    invalidTables = [];

    let content: string = await Neutralino.filesystem.readFile(loadPath)
    let tableSeparator: RegExp = /\r?\n\r?\n/g;
    let moreContent = true;
    while (moreContent) {
        let start: number = tableSeparator.lastIndex;
        let end: number;
        let result = tableSeparator.exec(content);
        if (result == null) {
            moreContent = false;
            end = content.length;
        } else {
            end = result.index;
        }
        if (!loadTable(content, start, end)) {
            invalidTables.push(forceStringClone(content.substring(start, end)));
        }
    }
}

function loadTable(content: string, start: number, end: number): boolean {
    let lineSeparator: RegExp = /\r?\n/g;
    lineSeparator.lastIndex = start;

    let result = lineSeparator.exec(content);
    if (result == null || result.index >= end) {
        return false;
    }
    let tableName: string[] = content.substring(start, result.index).split(',', 2);
    if (tableName.length < 2 || !BossList.hasOwnProperty(tableName[0])) {
        return false;
    }
    let bossName: BossType = forceStringClone(tableName[0]) as BossType;
    if (!BossList[bossName].difficulties.hasOwnProperty(tableName[1])) {
        return false;
    }
    let difficulty: Difficulty = forceStringClone(tableName[1]) as Difficulty;
    let history: LootHistory = histories[bossName][difficulty]!;

    let moreContent: boolean = true;
    start = lineSeparator.lastIndex;
    result = lineSeparator.exec(content);
    let lineEnd: number;
    if (result == null || result.index >= end) {
        moreContent = false;
        lineEnd = end;
    } else {
        lineEnd = result.index;
    }
    let columns: string[] = content.substring(start, lineEnd).split(',');
    for (let k: number = 0; k < columns.length; k++) {
        columns[k] = forceStringClone(columns[k]);
    }
    let columnSet: Set<string> = new Set<string>(columns);
    if (columns.length > columnSet.size) {
        return false;
    }
    const requiredColumns: Set<string> = new Set<string>([
        'date', 'clear_size', 'drop', 'greed', 'personal_drop', 'personal_greed'
    ]);
    for (let requiredColumn of requiredColumns) {
        if (!columnSet.has(requiredColumn)) {
            return false;
        }
    }
    let unknown: Set<string> = new Set<string>();
    for (let column of columnSet) {
        if (!requiredColumns.has(column) && column != 'notes' && !history.hasLootSlot(column)) {
            unknown.add(column);
        }
    }
    history.setUnknown(unknown);

    while (moreContent) {
        start = lineSeparator.lastIndex;
        result = lineSeparator.exec(content);
        if (result == null || result.index >= end) {
            moreContent = false;
            lineEnd = end;
        } else {
            lineEnd = result.index;
        }
        if (!loadRow(content, start, lineEnd, columns, history)) {
            history.addInvalidEntry(forceStringClone(content.substring(start, lineEnd)));
        }
    }

    return true;
}

function loadRow(
    content: string,
    start: number,
    end: number,
    columns: string[],
    history: LootHistory
): boolean {
    let parts: string[] = content.substring(start, end).split(',');
    for (let k = 0; k < parts.length; k++) {
        parts[k] = forceStringClone(parts[k]);
    }
    if (parts.length != columns.length) {
        return false;
    }
    let entry: Record<string, any> = { unknown: {} };
    for (let k = 0; k < parts.length; k++) {
        if (columns[k] == 'date') {
            let date: Date = parseDate(parts[k]);
            if (isNaN(date.getDate())) {
                return false;
            }
            entry.date = date;
        } else if (columns[k] == 'notes') {
            entry.notes = parts[k];
        } else if (columns[k] == 'clear_size' || columns[k] == 'drop' || columns[k] == 'greed'
            || columns[k] == 'personal_drop' || columns[k] == 'personal_greed'
            || history.hasLootSlot(columns[k])
        ) {
            let value: number = parts[k].length == 0 ? 0 : parseInt(parts[k]);
            if (isNaN(value)) {
                return false;
            }
            if (columns[k] == 'clear_size') {
                entry.clearSize = value;
            } else if (columns[k] == 'personal_drop') {
                entry.personalDrop = value;
            } else if (columns[k] == 'personal_greed') {
                entry.personalGreed = value;
            } else {
                entry[columns[k]] = value;
            }
        } else {
            entry.unknown[columns[k]] = parts[k];
        }
    }
    for (let slot of history.getLootSlots()) {
        if (!entry.hasOwnProperty(slot)) {
            entry[slot] = 0;
        }
    }
    entry.unknown = Object.freeze(entry.unknown);
    return history.addEntry(entry as LootEntry);
}

async function save(): Promise<void> {
    if (path == null) {
        throw new Error('No save path set - Must call SaveData.init() first');
    }

    let tables: string[] = [];
    let boss: BossType;
    for (boss in histories) {
        let difficulty: Difficulty;
        for (difficulty in histories[boss]) {
            let history: LootHistory = histories[boss][difficulty]!;
            if (history.entryCount() > 0) {
                let lines: string[] = [];
                lines.push(boss + ',' + difficulty);
                lines.push([
                    'date', 'clear_size', ...history.getLootSlots(),
                    'drop', 'greed', 'personal_drop', 'personal_greed',
                    'notes', ...history.getUnknown()
                ].join(','));
                for (let entry of history.getEntries()) {
                    let line: string[] = [ dateToString(entry.date), entry.clearSize.toString() ];
                    for (let lootSlot of history.getLootSlots()) {
                        line.push(entry[lootSlot] == 0 ? '' : entry[lootSlot]!.toString());
                    }
                    line.push(
                        entry.drop.toString(),
                        entry.greed.toString(),
                        entry.personalDrop.toString(),
                        entry.personalGreed.toString(),
                        entry.notes
                    );
                    for (let unknownColumn of history.getUnknown()) {
                        line.push(entry.unknown[unknownColumn] ?? '');
                    }
                    lines.push(line.join(','));
                }
                for (let invalidEntry of history.getInvalidEntries()) {
                    lines.push(invalidEntry);
                }
                tables.push(lines.join('\r\n'));
            }
        }
    }
    for (let table of invalidTables) {
        tables.push(table);
    }
    Neutralino.filesystem.writeFile(path, tables.join('\r\n\r\n'));
}

function getHistory(boss: BossType, difficulty: Difficulty): LootHistory {
    let history = histories[boss][difficulty];
    if (!history) {
        throw new Error(`Difficulty ${difficulty} does not exist for boss ${boss}`);
    }
    return history;
}

export const SaveData = {
    init,
    createNew,
    load,
    save,
    getHistory
} as const;
