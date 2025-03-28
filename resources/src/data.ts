export type Data<Key extends string, Value> = Readonly<Partial<Record<Key, Value>>>;

export type Difficulty = 'easy' | 'normal' | 'hard' | 'chaos' | 'extreme';

export const ReleaseDates = Object.freeze({
    furniture: new Date(2022, 7 - 1, 21),
    new_age: new Date(2023, 11 - 1, 16),
    nickyroid: new Date(2023, 12 - 1, 14),
    milestone: new Date(2024, 11 - 1, 21),
    eternal_box: new Date(2024, 12 - 1, 18),
    kalos_fan: new Date(2025, 2 - 1, 13)
});
export type ReleaseDate = keyof typeof ReleaseDates;

export function dateToString(date: Date): string {
    return date.toISOString().substring(0, 10);
}

export function parseDate(date: string): Date {
    return new Date(date);
}

export function getMaxDroprate(date: Date): number {
    if (date >= ReleaseDates.milestone) {
        return 500;
    } else {
        return 400;
    }
}

export interface LootSlot {
    readonly name: string;
    readonly equip: boolean;
    readonly instanced: boolean;
    readonly ignoreDroprate?: boolean;
    readonly skipTotal?: boolean;
    readonly releaseDate?: ReleaseDate;
}

const lootSlots = Object.freeze({
    abso_weapon: Object.freeze({
        name: 'AbsoLab Weapon Box',
        equip: false,
        instanced: true,
        ignoreDroprate: true
    }),
    abso_armor: Object.freeze({
        name: 'AbsoLab Armor Box',
        equip: false,
        instanced: true,
        ignoreDroprate: true
    }),
    arcane_weapon: Object.freeze({
        name: 'Arcane Umbra Weapon Box',
        equip: false,
        instanced: true,
        ignoreDroprate: true,
        skipTotal: true
    }),
    arcane_armor: Object.freeze({
        name: 'Arcane Umbra Armor Box',
        equip: false,
        instanced: true,
        ignoreDroprate: true,
        skipTotal: true
    }),
    eternal_armor: Object.freeze({
        name: 'Eternal Armor Box',
        equip: false,
        instanced: true,
        ignoreDroprate: true,
        skipTotal: true,
        releaseDate: 'eternal_box'
    }),
    dawn_normal: Object.freeze({
        name: 'Dawn Boss Accessory (Normal)',
        equip: true,
        instanced: false
    }),
    dawn: Object.freeze({
        name: 'Dawn Boss Accessory (Hard/Chaos)',
        equip: true,
        instanced: false
    }),
    pitched: Object.freeze({
        name: 'Pitched Boss Accessory',
        equip: true,
        instanced: false
    }),
    pitched_extreme: Object.freeze({
        name: 'Pitched Boss Accessory (Extreme)',
        equip: true,
        instanced: false
    }),
    black_heart: Object.freeze({
        name: 'Damaged Black Heart',
        equip: false,
        instanced: false,
        skipTotal: true
    }),
    brilliant: Object.freeze({
        name: 'Brilliant Boss Accessory',
        equip: true,
        instanced: false
    }),
    ruin_shield: Object.freeze({
        name: 'Ruin Force Shield',
        equip: true,
        instanced: false,
        skipTotal: true
    }),
    android_shared: Object.freeze({
        name: 'Android (Shared)',
        equip: true,
        instanced: false
    }),
    android_instanced: Object.freeze({
        name: 'Android (Instanced)',
        equip: true,
        instanced: true
    }),
    ring_box_1: Object.freeze({
        name: 'Green Jade Ring Box',
        equip: false,
        instanced: true,
        skipTotal: true,
        releaseDate: 'new_age'
    }),
    ring_box_2: Object.freeze({
        name: 'Red Jade Ring Box',
        equip: false,
        instanced: true,
        skipTotal: true,
        releaseDate: 'new_age'
    }),
    ring_box_3: Object.freeze({
        name: 'Black Jade Ring Box',
        equip: false,
        instanced: true,
        skipTotal: true,
        releaseDate: 'new_age'
    }),
    ring_box_4: Object.freeze({
        name: 'White Jade Ring Box',
        equip: false,
        instanced: true,
        skipTotal: true,
        releaseDate: 'new_age'
    }),
    ring_stone: Object.freeze({
        name: 'Grindstone of Life',
        equip: false,
        instanced: false,
        releaseDate: 'new_age'
    }),
    pitched_upgrade: Object.freeze({
        name: 'Exceptional Hammer',
        equip: false,
        instanced: false,
        ignoreDroprate: true
    }),
    furniture: Object.freeze({
        name: 'Furniture',
        equip: false,
        instanced: false,
        releaseDate: 'furniture'
    })
});
export type LootSlotType = keyof typeof lootSlots;
export const LootSlots: Readonly<Record<LootSlotType, LootSlot>> = lootSlots;

export interface LootInfo {
    readonly nameOverride?: string;
    readonly noEquip?: boolean;
    readonly excludeFromTotal?: boolean;
    readonly releaseDateOverride?: ReleaseDate;
    readonly summaryClarifier?: string;
}

export interface Boss {
    readonly name: string;
    readonly maxPartySize?: number;
    readonly difficulties: Data<Difficulty, BossDifficulty>;
};

export interface BossDifficulty {
    readonly maxPartySize?: number;
    readonly loots: Data<LootSlotType, LootInfo>;
}

const bossList = Object.freeze({
    lotus: Object.freeze({
        name: 'Lotus',
        difficulties: Object.freeze({
            hard: Object.freeze({
                loots: Object.freeze({
                    abso_weapon: Object.freeze({}),
                    abso_armor: Object.freeze({}),
                    pitched: Object.freeze({ nameOverride: 'Berserked', summaryClarifier: 'Zerk' }),
                    black_heart: Object.freeze({}),
                    android_shared: Object.freeze({ nameOverride: 'Lotusroid' }),
                    ring_box_2: Object.freeze({}),
                    furniture: Object.freeze({})
                })
            }),
            extreme: Object.freeze({
                maxPartySize: 2,
                loots: Object.freeze({
                    abso_weapon: Object.freeze({}),
                    abso_armor: Object.freeze({}),
                    pitched: Object.freeze({ nameOverride: 'Total Control', summaryClarifier: 'TC' }),
                    pitched_extreme: Object.freeze({ nameOverride: 'Berserked', summaryClarifier: 'Zerk' }),
                    black_heart: Object.freeze({}),
                    android_shared: Object.freeze({ nameOverride: 'Annihilation Weaon Lotusroid' }),
                    ring_box_4: Object.freeze({}),
                    furniture: Object.freeze({})
                })
            })
        })
    }),
    damien: Object.freeze({
        name: 'Damien',
        difficulties: Object.freeze({
            hard: Object.freeze({
                loots: Object.freeze({
                    abso_weapon: Object.freeze({}),
                    abso_armor: Object.freeze({}),
                    pitched: Object.freeze({ nameOverride: 'Magic Eyepatch' }),
                    ruin_shield: Object.freeze({}),
                    android_shared: Object.freeze({ nameOverride: 'Damienroid' }),
                    ring_box_2: Object.freeze({}),
                    furniture: Object.freeze({})
                })
            })
        })
    }),
    slime: Object.freeze({
        name: 'Guardian Angel Slime',
        difficulties: Object.freeze({
            normal: Object.freeze({
                loots: Object.freeze({
                    dawn_normal: Object.freeze({
                        nameOverride: 'Guardian Angel Ring',
                        excludeFromTotal: true
                    }),
                    ring_box_1: Object.freeze({})
                })
            }),
            chaos: Object.freeze({
                loots: Object.freeze({
                    dawn: Object.freeze({
                        nameOverride: 'Guardian Angel Ring',
                        excludeFromTotal: true
                    }),
                    ring_box_3: Object.freeze({}),
                    furniture: Object.freeze({})
                })
            })
        })
    }),
    lucid: Object.freeze({
        name: 'Lucid',
        difficulties: Object.freeze({
            normal: Object.freeze({
                loots: Object.freeze({
                    dawn_normal: Object.freeze({ nameOverride: 'Twilight Mark' }),
                    ring_box_1: Object.freeze({})
                })
            }),
            hard: Object.freeze({
                loots: Object.freeze({
                    arcane_weapon: Object.freeze({}),
                    arcane_armor: Object.freeze({}),
                    dawn: Object.freeze({ nameOverride: 'Twilight Mark' }),
                    pitched: Object.freeze({ nameOverride: 'Dreamy Belt' }),
                    android_instanced: Object.freeze({ nameOverride: 'Lucidroid' }),
                    ring_box_2: Object.freeze({}),
                    furniture: Object.freeze({})
                })
            })
        })
    }),
    will: Object.freeze({
        name: 'Will',
        difficulties: Object.freeze({
            normal: Object.freeze({
                loots: Object.freeze({
                    dawn_normal: Object.freeze({ nameOverride: 'Twilight Mark' }),
                    ring_box_1: Object.freeze({})
                })
            }),
            hard: Object.freeze({
                loots: Object.freeze({
                    arcane_weapon: Object.freeze({}),
                    arcane_armor: Object.freeze({}),
                    dawn: Object.freeze({ nameOverride: 'Twilight Mark' }),
                    pitched: Object.freeze({
                        nameOverride: 'Cursed Spellbook',
                        noEquip: true
                    }),
                    ring_box_2: Object.freeze({}),
                    furniture: Object.freeze({})
                })
            })
        })
    }),
    gloom: Object.freeze({
        name: 'Gloom',
        difficulties: Object.freeze({
            normal: Object.freeze({
                loots: Object.freeze({
                    dawn_normal: Object.freeze({ nameOverride: 'Estella Earrings' }),
                    ring_box_1: Object.freeze({})
                })
            }),
            chaos: Object.freeze({
                loots: Object.freeze({
                    arcane_weapon: Object.freeze({}),
                    arcane_armor: Object.freeze({}),
                    dawn: Object.freeze({ nameOverride: 'Estella Earrings' }),
                    pitched: Object.freeze({ nameOverride: 'Endless Terror' }),
                    ring_box_3: Object.freeze({}),
                    furniture: Object.freeze({})
                })
            })
        })
    }),
    vhilla: Object.freeze({
        name: 'Verus Hilla',
        difficulties: Object.freeze({
            normal: Object.freeze({
                loots: Object.freeze({
                    arcane_weapon: Object.freeze({}),
                    arcane_armor: Object.freeze({}),
                    dawn_normal: Object.freeze({ nameOverride: 'Daybreak Pendant' }),
                    ring_box_2: Object.freeze({})
                })
            }),
            hard: Object.freeze({
                loots: Object.freeze({
                    arcane_weapon: Object.freeze({}),
                    arcane_armor: Object.freeze({}),
                    dawn: Object.freeze({ nameOverride: 'Daybreak Pendant' }),
                    pitched: Object.freeze({ nameOverride: 'Source of Suffering' }),
                    ring_box_3: Object.freeze({}),
                    furniture: Object.freeze({})
                })
            })
        })
    }),
    darknell: Object.freeze({
        name: 'Darknell',
        difficulties: Object.freeze({
            normal: Object.freeze({
                loots: Object.freeze({
                    dawn_normal: Object.freeze({ nameOverride: 'Estella Earrings' }),
                    ring_box_1: Object.freeze({})
                })
            }),
            hard: Object.freeze({
                loots: Object.freeze({
                    arcane_weapon: Object.freeze({}),
                    arcane_armor: Object.freeze({}),
                    dawn: Object.freeze({ nameOverride: 'Estella Earrings' }),
                    pitched: Object.freeze({ nameOverride: 'Commanding Force Earrings' }),
                    ring_box_3: Object.freeze({}),
                    furniture: Object.freeze({})
                })
            })
        })
    }),
    black_mage: Object.freeze({
        name: 'Black Mage',
        difficulties: Object.freeze({
            hard: Object.freeze({
                loots: Object.freeze({
                    arcane_weapon: Object.freeze({}),
                    arcane_armor: Object.freeze({}),
                    pitched: Object.freeze({
                        nameOverride: 'Genesis Badge',
                        excludeFromTotal: true
                    }),
                    ring_box_4: Object.freeze({}),
                    furniture: Object.freeze({ excludeFromTotal: true })
                })
            }),
            extreme: Object.freeze({
                loots: Object.freeze({
                    arcane_weapon: Object.freeze({}),
                    arcane_armor: Object.freeze({}),
                    pitched_extreme: Object.freeze({
                        nameOverride: 'Genesis Badge',
                        excludeFromTotal: true
                    }),
                    ring_box_4: Object.freeze({}),
                    pitched_upgrade: Object.freeze({ excludeFromTotal: true }),
                    furniture: Object.freeze({ excludeFromTotal: true })
                })
            })
        })
    }),
    seren: Object.freeze({
        name: 'Chosen Seren',
        difficulties: Object.freeze({
            normal: Object.freeze({
                loots: Object.freeze({
                    dawn_normal: Object.freeze({ nameOverride: 'Daybreak Pendant' }),
                    ring_box_3: Object.freeze({})
                })
            }),
            hard: Object.freeze({
                loots: Object.freeze({
                    dawn: Object.freeze({ nameOverride: 'Daybreak Pendant' }),
                    pitched: Object.freeze({
                        nameOverride: 'Mitra\'s Rage',
                        noEquip: true,
                        excludeFromTotal: true
                    }),
                    ring_box_4: Object.freeze({}),
                    furniture: Object.freeze({})
                })
            }),
            extreme: Object.freeze({
                loots: Object.freeze({
                    dawn: Object.freeze({
                        nameOverride: 'Daybreak Pendant',
                        excludeFromTotal: true
                    }),
                    pitched_extreme: Object.freeze({
                        nameOverride: 'Mitra\'s Rage',
                        noEquip: true,
                        excludeFromTotal: true
                    }),
                    ring_box_4: Object.freeze({}),
                    pitched_upgrade: Object.freeze({}),
                    furniture: Object.freeze({ excludeFromTotal: true })
                })
            })
        })
    }),
    kalos: Object.freeze({
        name: 'Kalos the Guardian',
        difficulties: Object.freeze({
            easy: Object.freeze({
                loots: Object.freeze({
                    ring_box_4: Object.freeze({}),
                    ring_stone: Object.freeze({})
                })
            }),
            normal: Object.freeze({
                loots: Object.freeze({
                    android_shared: Object.freeze({
                        nameOverride: 'Nickyroid',
                        releaseDateOverride: 'nickyroid'
                    }),
                    ring_box_4: Object.freeze({}),
                    ring_stone: Object.freeze({}),
                    furniture: Object.freeze({ releaseDateOverride: 'kalos_fan' })
                })
            }),
            chaos: Object.freeze({
                loots: Object.freeze({
                    eternal_armor: Object.freeze({ nameOverride: 'Divine Eternal Armor Box' }),
                    android_shared: Object.freeze({
                        nameOverride: 'Nickyroid',
                        releaseDateOverride: 'nickyroid'
                    }),
                    ring_box_4: Object.freeze({}),
                    ring_stone: Object.freeze({})
                })
            }),
            extreme: Object.freeze({
                loots: Object.freeze({
                    eternal_armor: Object.freeze({ nameOverride: 'Divine Eternal Armor Box' }),
                    android_shared: Object.freeze({
                        nameOverride: 'Nickyroid',
                        releaseDateOverride: 'nickyroid'
                    }),
                    ring_box_4: Object.freeze({}),
                    ring_stone: Object.freeze({}),
                    pitched_upgrade: Object.freeze({})
                })
            })
        })
    }),
    kaling: Object.freeze({
        name: 'Kaling',
        difficulties: Object.freeze({
            easy: Object.freeze({
                loots: Object.freeze({
                    ring_box_4: Object.freeze({}),
                    ring_stone: Object.freeze({})
                })
            }),
            normal: Object.freeze({
                loots: Object.freeze({
                    android_shared: Object.freeze({ nameOverride: 'Kalingroid' }),
                    ring_box_4: Object.freeze({}),
                    ring_stone: Object.freeze({})
                })
            }),
            hard: Object.freeze({
                loots: Object.freeze({
                    eternal_armor: Object.freeze({ nameOverride: 'Ferocious Beast Eternal Armor Box' }),
                    android_shared: Object.freeze({ nameOverride: 'Kalingroid' }),
                    ring_box_4: Object.freeze({}),
                    ring_stone: Object.freeze({})
                })
            }),
            extreme: Object.freeze({
                loots: Object.freeze({
                    eternal_armor: Object.freeze({ nameOverride: 'Ferocious Beast Eternal Armor Box' }),
                    android_shared: Object.freeze({ nameOverride: 'Kalingroid' }),
                    ring_box_4: Object.freeze({}),
                    ring_stone: Object.freeze({}),
                    pitched_upgrade: Object.freeze({})
                })
            })
        })
    }),
    limbo: Object.freeze({
        name: 'Limbo',
        maxPartySize: 3,
        difficulties: Object.freeze({
            normal: Object.freeze({
                loots: Object.freeze({
                    android_shared: Object.freeze({ nameOverride: 'Limboroid' }),
                    ring_box_4: Object.freeze({})
                })
            }),
            hard: Object.freeze({
                loots: Object.freeze({
                    eternal_armor: Object.freeze({ nameOverride: 'Eternal Armor of Desire Box' }),
                    android_shared: Object.freeze({ nameOverride: 'Limboroid' }),
                    brilliant: Object.freeze({ nameOverride: 'Whisper of the Source' }),
                    ring_box_4: Object.freeze({})
                })
            })
        })
    })
});
export type BossType = keyof typeof bossList;
export const BossList: Readonly<Record<BossType, Boss>> = bossList;

export function getMaxPartySize(boss: BossType, difficulty: Difficulty): number {
    return BossList[boss].difficulties[difficulty]?.maxPartySize ?? BossList[boss].maxPartySize ?? 6;
}
