// 游戏数据

// 职业数据
const classData = {
    warrior: {
        name: "战士",
        baseStats: { hp: 100, atk: 10, def: 5, mp: 0, agi: 3 },
        growthStats: { hp: 15, atk: 2, def: 1, mp: 0, agi: 0.5 },
        initialSkill: "重击"
    },
    mage: {
        name: "法师",
        baseStats: { hp: 70, atk: 5, def: 2, mp: 20, agi: 4 },
        growthStats: { hp: 10, atk: 1, def: 0.5, mp: 3, agi: 0.7 },
        initialSkill: "火球术"
    },
    ranger: {
        name: "游侠",
        baseStats: { hp: 85, atk: 8, def: 3, mp: 5, agi: 6 },
        growthStats: { hp: 12, atk: 1.5, def: 0.7, mp: 1, agi: 1 },
        initialSkill: "精准射击"
    }
};

// 装备稀有度
const rarityData = {
    common: { name: "普通", color: "#aaa", minStats: 0.8, maxStats: 1.0, affixCount: [0, 1] },
    uncommon: { name: "优秀", color: "#2ecc71", minStats: 1.0, maxStats: 1.2, affixCount: [1, 2] },
    rare: { name: "精良", color: "#3498db", minStats: 1.2, maxStats: 1.5, affixCount: [2, 3] },
    epic: { name: "史诗", color: "#9b59b6", minStats: 1.5, maxStats: 1.8, affixCount: [3, 4] },
    legendary: { name: "传说", color: "#e67e22", minStats: 1.8, maxStats: 2.2, affixCount: [4, 5] }
};

// 装备词条
const affixData = {
    // 基础属性词条
    atkPercent: { name: "攻击力", stat: "atk", type: "percent", min: 5, max: 20 },
    hpPercent: { name: "生命值", stat: "hp", type: "percent", min: 5, max: 20 },
    defPercent: { name: "防御力", stat: "def", type: "percent", min: 5, max: 20 },
    critRate: { name: "暴击率", stat: "critRate", type: "flat", min: 1, max: 5 },
    attackSpeed: { name: "攻击速度", stat: "attackSpeed", type: "flat", min: 1, max: 3 },
    
    // 特殊效果词条 (仅在精良及以上装备出现)
    bleedChance: { 
        name: "流血几率", 
        description: "攻击时{value}%概率造成流血", 
        min: 5, 
        max: 15,
        minRarity: "rare"
    },
    lifeSteal: { 
        name: "生命偷取", 
        description: "击杀怪物后恢复{value}%生命", 
        min: 2, 
        max: 8,
        minRarity: "rare"
    },
    eliteDamage: { 
        name: "精英伤害", 
        description: "对精英怪伤害+{value}%", 
        min: 10, 
        max: 30,
        minRarity: "rare"
    },
    goldFind: { 
        name: "金币获取", 
        description: "金币获取+{value}%", 
        min: 5, 
        max: 20,
        minRarity: "rare"
    }
};

// 装备类型
const equipmentTypes = {
    weapon: { name: "武器", statMultiplier: 1.0 },
    helmet: { name: "头盔", statMultiplier: 0.7 },
    armor: { name: "胸甲", statMultiplier: 1.0 },
    legs: { name: "护腿", statMultiplier: 0.8 },
    boots: { name: "靴子", statMultiplier: 0.6 }
};

// 关卡数据
const stageData = [
    {
        id: "plains_1",
        name: "新手平原 I",
        area: "新手平原",
        recommendedLevel: 1,
        monsters: [
            { type: "slime", name: "小型史莱姆", hp: 20, atk: 3, def: 1, exp: 5, gold: { min: 1, max: 3 } }
        ],
        dropTable: {
            equipment: [
                { rarity: "common", chance: 0.1 },
                { rarity: "uncommon", chance: 0.01 }
            ]
        }
    },
    {
        id: "plains_2",
        name: "新手平原 II",
        area: "新手平原",
        recommendedLevel: 3,
        monsters: [
            { type: "slime", name: "小型史莱姆", hp: 20, atk: 3, def: 1, exp: 5, gold: { min: 1, max: 3 } },
            { type: "rat", name: "巨鼠", hp: 25, atk: 4, def: 1, exp: 7, gold: { min: 2, max: 4 } }
        ],
        dropTable: {
            equipment: [
                { rarity: "common", chance: 0.15 },
                { rarity: "uncommon", chance: 0.03 }
            ]
        }
    },
    {
        id: "plains_3",
        name: "新手平原 III",
        area: "新手平原",
        recommendedLevel: 5,
        monsters: [
            { type: "rat", name: "巨鼠", hp: 25, atk: 4, def: 1, exp: 7, gold: { min: 2, max: 4 } },
            { type: "goblin", name: "哥布林", hp: 35, atk: 6, def: 2, exp: 10, gold: { min: 3, max: 6 } }
        ],
        dropTable: {
            equipment: [
                { rarity: "common", chance: 0.2 },
                { rarity: "uncommon", chance: 0.05 },
                { rarity: "rare", chance: 0.005 }
            ]
        }
    },
    {
        id: "forest_1",
        name: "幽暗森林 I",
        area: "幽暗森林",
        recommendedLevel: 10,
        monsters: [
            { type: "wolf", name: "森林狼", hp: 60, atk: 12, def: 4, exp: 20, gold: { min: 5, max: 10 } },
            { type: "goblin_archer", name: "哥布林弓箭手", hp: 45, atk: 15, def: 3, exp: 18, gold: { min: 4, max: 9 } }
        ],
        dropTable: {
            equipment: [
                { rarity: "common", chance: 0.25 },
                { rarity: "uncommon", chance: 0.1 },
                { rarity: "rare", chance: 0.01 }
            ],
            petEgg: { chance: 0.005 }
        }
    },
    {
        id: "abyss",
        name: "深渊",
        area: "深渊",
        recommendedLevel: 100,
        monsters: [
            { type: "demon", name: "深渊恶魔", hp: 600, atk: 1200, def: 4, exp: 20, gold: { min: 5, max: 10 } }
        ],
        dropTable: {
            equipment: [
                { rarity: "common", chance: 0.25 },
                { rarity: "uncommon", chance: 0.1 },
                { rarity: "rare", chance: 0.01 }
            ],
            petEgg: { chance: 0.005 }
        }
    }
];

// 经验曲线
function getExpForLevel(level) {
    const baseExp = 100;
    return Math.floor(baseExp * Math.pow(1.15, level - 1));
}

// 装备强度增长系数
function getEquipmentScalingFactor(level) {
    if (level <= 10) return 1.0;
    if (level <= 20) return 1.3;
    if (level <= 30) return 1.7;
    if (level <= 40) return 2.2;
    return 2.8;
}