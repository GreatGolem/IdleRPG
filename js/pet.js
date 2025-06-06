// 魔宠系统数据和函数

// 魔宠类型数据
const petTypeData = {
    fire: { name: "火系", icon: "🔥", color: "#e74c3c" },
    water: { name: "水系", icon: "💧", color: "#3498db" },
    earth: { name: "土系", icon: "🌱", color: "#2ecc71" },
    wind: { name: "风系", icon: "🌪️", color: "#95a5a6" },
    light: { name: "光系", icon: "✨", color: "#f1c40f" },
    dark: { name: "暗系", icon: "🌑", color: "#34495e" }
};

// 魔宠品质数据
const petRarityData = {
    common: { name: "普通", color: "#aaa", statMultiplier: 1.0, skillSlots: 1 },
    uncommon: { name: "优秀", color: "#2ecc71", statMultiplier: 1.2, skillSlots: 2 },
    rare: { name: "精良", color: "#3498db", statMultiplier: 1.5, skillSlots: 2 },
    epic: { name: "史诗", color: "#9b59b6", statMultiplier: 1.8, skillSlots: 3 },
    legendary: { name: "传说", color: "#e67e22", statMultiplier: 2.2, skillSlots: 3 }
};

// 魔宠主动技能数据
const petActiveSkillData = {
    fireball: {
        name: "火球术",
        type: "fire",
        description: "对敌人造成{value}%攻击力的火焰伤害",
        damageMultiplier: 1.5,
        cooldown: 3
    },
    waterblast: {
        name: "水流冲击",
        type: "water",
        description: "对敌人造成{value}%攻击力的水系伤害",
        damageMultiplier: 1.3,
        cooldown: 2
    },
    earthquake: {
        name: "地震术",
        type: "earth",
        description: "对敌人造成{value}%攻击力的土系伤害",
        damageMultiplier: 1.8,
        cooldown: 4
    },
    windslash: {
        name: "风刃",
        type: "wind",
        description: "对敌人造成{value}%攻击力的风系伤害",
        damageMultiplier: 1.2,
        cooldown: 1
    },
    holylight: {
        name: "圣光术",
        type: "light",
        description: "对敌人造成{value}%攻击力的光系伤害",
        damageMultiplier: 1.6,
        cooldown: 3
    },
    shadowbolt: {
        name: "暗影箭",
        type: "dark",
        description: "对敌人造成{value}%攻击力的暗系伤害",
        damageMultiplier: 1.7,
        cooldown: 3
    }
};

// 魔宠被动技能数据
const petPassiveSkillData = {
    atkBoost: {
        name: "攻击强化",
        description: "增加{value}%攻击力",
        stat: "atk",
        type: "percent",
        min: 5,
        max: 15
    },
    hpBoost: {
        name: "生命强化",
        description: "增加{value}%最大生命值",
        stat: "hp",
        type: "percent",
        min: 5,
        max: 15
    },
    defBoost: {
        name: "防御强化",
        description: "增加{value}%防御力",
        stat: "def",
        type: "percent",
        min: 5,
        max: 15
    },
    critRateBoost: {
        name: "暴击强化",
        description: "增加{value}%暴击率",
        stat: "critRate",
        type: "flat",
        min: 2,
        max: 8
    },
    critDamageBoost: {
        name: "暴伤强化",
        description: "增加{value}%暴击伤害",
        stat: "critDamage",
        type: "flat",
        min: 5,
        max: 20
    },
    luckyBlessing: {
        name: "幸运祝福",
        description: "装备掉落几率增加{value}%",
        stat: "dropRate",
        type: "percent",
        min: 5,
        max: 15
    },
    goldBoost: {
        name: "金币强化",
        description: "金币获取增加{value}%",
        stat: "goldFind",
        type: "percent",
        min: 5,
        max: 20
    },
    expBoost: {
        name: "经验强化",
        description: "经验获取增加{value}%",
        stat: "expFind",
        type: "percent",
        min: 5,
        max: 15
    }
};

// 魔宠蛋数据
const petEggData = {
    common: { name: "普通魔宠蛋", rarityChances: { common: 0.8, uncommon: 0.2 } },
    uncommon: { name: "优秀魔宠蛋", rarityChances: { common: 0.5, uncommon: 0.4, rare: 0.1 } },
    rare: { name: "精良魔宠蛋", rarityChances: { uncommon: 0.6, rare: 0.35, epic: 0.05 } },
    epic: { name: "史诗魔宠蛋", rarityChances: { rare: 0.6, epic: 0.35, legendary: 0.05 } },
    legendary: { name: "传说魔宠蛋", rarityChances: { epic: 0.7, legendary: 0.3 } }
};

// 生成随机魔宠名称
function generatePetName() {
    const prefixes = ["小", "大", "炎", "冰", "雷", "风", "光", "暗", "神", "魔", "幻", "星"];
    const suffixes = ["猫", "狗", "龙", "鹰", "虎", "狼", "蛇", "熊", "鼠", "兔", "猴", "鹿"];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return prefix + suffix;
}

// 生成随机魔宠
function generatePet(rarity, level) {
    // 随机选择魔宠类型
    const petTypeKeys = Object.keys(petTypeData);
    const type = petTypeKeys[Math.floor(Math.random() * petTypeKeys.length)];
    
    // 获取魔宠品质信息
    const rarityInfo = petRarityData[rarity];
    
    // 生成基础属性
    const baseValue = Math.floor(5 * getEquipmentScalingFactor(level));
    const statMultiplier = rarityInfo.statMultiplier;
    
    // 生成主动技能
    const activeSkillKeys = Object.keys(petActiveSkillData).filter(key => petActiveSkillData[key].type === type);
    const activeSkill = activeSkillKeys.length > 0 ? 
        activeSkillKeys[Math.floor(Math.random() * activeSkillKeys.length)] : 
        Object.keys(petActiveSkillData)[Math.floor(Math.random() * Object.keys(petActiveSkillData).length)];
    
    // 生成被动技能
    const passiveSkills = [];
    const passiveSkillCount = rarityInfo.skillSlots - 1; // 减去主动技能占用的一个槽位
    
    if (passiveSkillCount > 0) {
        const availablePassiveSkills = Object.keys(petPassiveSkillData);
        
        for (let i = 0; i < passiveSkillCount; i++) {
            if (availablePassiveSkills.length === 0) break;
            
            const skillIndex = Math.floor(Math.random() * availablePassiveSkills.length);
            const skillId = availablePassiveSkills[skillIndex];
            const skill = petPassiveSkillData[skillId];
            
            // 生成技能值
            const value = Math.floor(Math.random() * (skill.max - skill.min + 1)) + skill.min;
            
            // 添加技能
            passiveSkills.push({
                id: skillId,
                value: value
            });
            
            // 移除已选择的技能，避免重复
            availablePassiveSkills.splice(skillIndex, 1);
        }
    }
    
    // 返回生成的魔宠
    return {
        name: generatePetName(),
        type: type,
        rarity: rarity,
        level: level,
        exp: 0,
        stats: {
            atk: Math.floor(baseValue * statMultiplier * 0.8),
            hp: Math.floor(baseValue * statMultiplier * 3),
            def: Math.floor(baseValue * statMultiplier * 0.5)
        },
        activeSkill: {
            id: activeSkill,
            cooldown: 0
        },
        passiveSkills: passiveSkills,
        isActive: false // 是否出战
    };
}

// 从魔宠蛋生成魔宠
function hatchPetEgg(eggRarity, playerLevel) {
    const eggInfo = petEggData[eggRarity];
    
    // 随机决定魔宠品质
    let rarityRoll = Math.random();
    let petRarity = "common";
    
    for (const [rarity, chance] of Object.entries(eggInfo.rarityChances)) {
        if (rarityRoll < chance) {
            petRarity = rarity;
            break;
        }
        rarityRoll -= chance;
    }
    
    // 生成魔宠
    return generatePet(petRarity, playerLevel);
}

// 计算魔宠技能伤害
function calculatePetSkillDamage(pet, skill, playerStats) {
    const skillInfo = petActiveSkillData[skill.id];
    const baseDamage = playerStats.atk * (pet.stats.atk / 100);
    return Math.floor(baseDamage * skillInfo.damageMultiplier);
}

// 获取魔宠提供的属性加成
function getPetBonusStats(pet) {
    const bonusStats = {
        atk: 0,
        hp: 0,
        def: 0,
        critRate: 0,
        critDamage: 0,
        dropRate: 0,
        goldFind: 0,
        expFind: 0
    };
    
    // 只有激活的魔宠才提供属性加成
    if (!pet.isActive) return bonusStats;
    
    // 计算被动技能提供的属性加成
    pet.passiveSkills.forEach(skill => {
        const skillInfo = petPassiveSkillData[skill.id];
        
        if (skillInfo.type === "percent") {
            bonusStats[skillInfo.stat] += skill.value / 100;
        } else if (skillInfo.type === "flat") {
            bonusStats[skillInfo.stat] += skill.value;
        }
    });
    
    return bonusStats;
}

// 获取魔宠升级所需经验
function getPetExpForLevel(level) {
    const baseExp = 50;
    return Math.floor(baseExp * Math.pow(1.12, level - 1));
}

// 检查魔宠升级
function checkPetLevelUp(pet) {
    const expNeeded = getPetExpForLevel(pet.level);
    
    if (pet.exp >= expNeeded) {
        // 升级
        pet.level++;
        pet.exp -= expNeeded;
        
        // 更新属性
        const baseValue = Math.floor(5 * getEquipmentScalingFactor(pet.level));
        const statMultiplier = petRarityData[pet.rarity].statMultiplier;
        
        pet.stats.atk = Math.floor(baseValue * statMultiplier * 0.8);
        pet.stats.hp = Math.floor(baseValue * statMultiplier * 3);
        pet.stats.def = Math.floor(baseValue * statMultiplier * 0.5);
        
        // 继续检查是否可以再次升级
        return true;
    }
    
    return false;
}