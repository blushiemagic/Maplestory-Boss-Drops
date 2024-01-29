export type Data<Key extends string, Value> = Readonly<Partial<Record<Key, Value>>>;

export type Difficulty = 'easy' | 'normal' | 'hard' | 'chaos' | 'extreme';

export const ReleaseDates = Object.freeze({
    furniture: new Date(2022, 7 - 1, 21),
    new_age: new Date(2023, 11 - 1, 16),
    nickyroid: new Date(2023, 12 - 1, 14)
});
export type ReleaseDate = keyof typeof ReleaseDates;

export function dateToString(date: Date): string {
    return date.toISOString().substring(0, 10);
}

export function parseDate(date: string): Date {
    return new Date(date);
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
    black_heart: Object.freeze({
        name: 'Damaged Black Heart',
        equip: false,
        instanced: false,
        skipTotal: true
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
        name: 'Exceptional Part',
        equip: false,
        instanced: false
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
}

export interface Boss{
    readonly name: string;
    readonly loots: Data<Difficulty, Data<LootSlotType, LootInfo>>;
};

const bossList = Object.freeze({
    lotus: Object.freeze({
        name: 'Lotus',
        loots: Object.freeze({
            hard: Object.freeze({
                abso_weapon: Object.freeze({}),
                abso_armor: Object.freeze({}),
                pitched: Object.freeze({ nameOverride: 'Berserked' }),
                black_heart: Object.freeze({}),
                android_shared: Object.freeze({ nameOverride: 'Lotusroid' }),
                ring_box_2: Object.freeze({}),
                furniture: Object.freeze({})
            })
        })
    }),
    damien: Object.freeze({
        name: 'Damien',
        loots: Object.freeze({
            hard: Object.freeze({
                abso_weapon: Object.freeze({}),
                abso_armor: Object.freeze({}),
                pitched: Object.freeze({ nameOverride: 'Magic Eyepatch' }),
                ruin_shield: Object.freeze({}),
                android_shared: Object.freeze({ nameOverride: 'Damienroid' }),
                ring_box_2: Object.freeze({}),
                furniture: Object.freeze({})
            })
        })
    }),
    slime: Object.freeze({
        name: 'Guardian Angel Slime',
        loots: Object.freeze({
            normal: Object.freeze({
                dawn_normal: Object.freeze({
                    nameOverride: 'Guardian Angel Ring',
                    excludeFromTotal: true
                }),
                ring_box_1: Object.freeze({})
            }),
            chaos: Object.freeze({
                dawn: Object.freeze({
                    nameOverride: 'Guardian Angel Ring',
                    excludeFromTotal: true
                }),
                ring_box_3: Object.freeze({}),
                furniture: Object.freeze({})
            })
        })
    }),
    lucid: Object.freeze({
        name: 'Lucid',
        loots: Object.freeze({
            normal: Object.freeze({
                dawn_normal: Object.freeze({ nameOverride: 'Twilight Mark' }),
                ring_box_1: Object.freeze({})
            }),
            hard: Object.freeze({
                arcane_weapon: Object.freeze({}),
                arcane_armor: Object.freeze({}),
                dawn: Object.freeze({ nameOverride: 'Twilight Mark' }),
                pitched: Object.freeze({ nameOverride: 'Dreamy Belt' }),
                android_instanced: Object.freeze({ nameOverride: 'Lucidroid' }),
                ring_box_2: Object.freeze({}),
                furniture: Object.freeze({})
            })
        })
    }),
    will: Object.freeze({
        name: 'Will',
        loots: Object.freeze({
            normal: Object.freeze({
                dawn_normal: Object.freeze({ nameOverride: 'Twilight Mark' }),
                ring_box_1: Object.freeze({})
            }),
            hard: Object.freeze({
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
    }),
    gloom: Object.freeze({
        name: 'Gloom',
        loots: Object.freeze({
            normal: Object.freeze({
                dawn_normal: Object.freeze({ nameOverride: 'Estella Earrings' }),
                ring_box_1: Object.freeze({})
            }),
            chaos: Object.freeze({
                arcane_weapon: Object.freeze({}),
                arcane_armor: Object.freeze({}),
                dawn: Object.freeze({ nameOverride: 'Estella Earrings' }),
                pitched: Object.freeze({ nameOverride: 'Endless Terror' }),
                ring_box_3: Object.freeze({}),
                furniture: Object.freeze({})
            })
        })
    }),
    vhilla: Object.freeze({
        name: 'Verus Hilla',
        loots: Object.freeze({
            normal: Object.freeze({
                arcane_weapon: Object.freeze({}),
                arcane_armor: Object.freeze({}),
                dawn_normal: Object.freeze({ nameOverride: 'Daybreak Pendant' }),
                ring_box_2: Object.freeze({})
            }),
            hard: Object.freeze({
                arcane_weapon: Object.freeze({}),
                arcane_armor: Object.freeze({}),
                dawn: Object.freeze({ nameOverride: 'Daybreak Pendant' }),
                pitched: Object.freeze({ nameOverride: 'Source of Suffering' }),
                ring_box_3: Object.freeze({}),
                furniture: Object.freeze({})
            })
        })
    }),
    darknell: Object.freeze({
        name: 'Darknell',
        loots: Object.freeze({
            normal: Object.freeze({
                dawn_normal: Object.freeze({ nameOverride: 'Estella Earrings' }),
                ring_box_1: Object.freeze({})
            }),
            hard: Object.freeze({
                arcane_weapon: Object.freeze({}),
                arcane_armor: Object.freeze({}),
                dawn: Object.freeze({ nameOverride: 'Estella Earrings' }),
                pitched: Object.freeze({ nameOverride: 'Commanding Force Earrings' }),
                ring_box_3: Object.freeze({}),
                furniture: Object.freeze({})
            })
        })
    }),
    black_mage: Object.freeze({
        name: 'Black Mage',
        loots: Object.freeze({
            hard: Object.freeze({
                arcane_weapon: Object.freeze({}),
                arcane_armor: Object.freeze({}),
                pitched: Object.freeze({
                    nameOverride: 'Genesis Badge',
                    excludeFromTotal: true
                }),
                ring_box_4: Object.freeze({}),
                furniture: Object.freeze({ excludeFromTotal: true })
            }),
            extreme: Object.freeze({
                arcane_weapon: Object.freeze({}),
                arcane_armor: Object.freeze({}),
                pitched: Object.freeze({
                    nameOverride: 'Genesis Badge',
                    excludeFromTotal: true
                }),
                ring_box_4: Object.freeze({}),
                pitched_upgrade: Object.freeze({
                    nameOverride: 'Nightmare Fragment',
                    excludeFromTotal: true
                }),
                furniture: Object.freeze({ excludeFromTotal: true })
            })
        })
    }),
    seren: Object.freeze({
        name: 'Chosen Seren',
        loots: Object.freeze({
            normal: Object.freeze({
                dawn_normal: Object.freeze({ nameOverride: 'Daybreak Pendant' }),
                ring_box_3: Object.freeze({})
            }),
            hard: Object.freeze({
                dawn: Object.freeze({ nameOverride: 'Daybreak Pendant' }),
                pitched: Object.freeze({
                    nameOverride: 'Mitra\'s Rage',
                    noEquip: true,
                    excludeFromTotal: true
                }),
                ring_box_4: Object.freeze({}),
                furniture: Object.freeze({})
            }),
            extreme: Object.freeze({
                dawn: Object.freeze({
                    nameOverride: 'Daybreak Pendant',
                    excludeFromTotal: true
                }),
                pitched: Object.freeze({
                    nameOverride: 'Mitra\'s Rage',
                    noEquip: true,
                    excludeFromTotal: true
                }),
                ring_box_4: Object.freeze({}),
                pitched_upgrade: Object.freeze({ nameOverride: 'Gravity Module' }),
                furniture: Object.freeze({ excludeFromTotal: true })
            })
        })
    }),
    kalos: Object.freeze({
        name: 'Kalos the Guardian',
        loots: Object.freeze({
            easy: Object.freeze({
                ring_box_4: Object.freeze({}),
                ring_stone: Object.freeze({})
            }),
            normal: Object.freeze({
                android_shared: Object.freeze({
                    nameOverride: 'Nickyroid',
                    releaseDateOverride: 'nickyroid'
                }),
                ring_box_4: Object.freeze({}),
                ring_stone: Object.freeze({})
            }),
            chaos: Object.freeze({
                android_shared: Object.freeze({
                    nameOverride: 'Nickyroid',
                    releaseDateOverride: 'nickyroid'
                }),
                ring_box_4: Object.freeze({}),
                ring_stone: Object.freeze({})
            }),
            extreme: Object.freeze({
                android_shared: Object.freeze({
                    nameOverride: 'Nickyroid',
                    releaseDateOverride: 'nickyroid'
                }),
                ring_box_4: Object.freeze({}),
                ring_stone: Object.freeze({}),
                pitched_upgrade: Object.freeze({ nameOverride: 'Mark of Destruction' })
            })
        })
    }),
    kaling: Object.freeze({
        name: 'Kaling',
        loots: Object.freeze({
            easy: Object.freeze({
                ring_box_4: Object.freeze({}),
                ring_stone: Object.freeze({})
            }),
            normal: Object.freeze({
                android_shared: Object.freeze({ nameOverride: 'Kalingroid' }),
                ring_box_4: Object.freeze({}),
                ring_stone: Object.freeze({})
            }),
            hard: Object.freeze({
                android_shared: Object.freeze({ nameOverride: 'Kalingroid' }),
                ring_box_4: Object.freeze({}),
                ring_stone: Object.freeze({})
            }),
            extreme: Object.freeze({
                android_shared: Object.freeze({ nameOverride: 'Kalingroid' }),
                ring_box_4: Object.freeze({}),
                ring_stone: Object.freeze({}),
                pitched_upgrade: Object.freeze({ nameOverride: 'Helmet of Loyalty' })
            })
        })
    })
});
export type BossType = keyof typeof bossList;
export const BossList: Readonly<Record<BossType, Boss>> = bossList;
