// 技能系统数据和函数

// 技能等级系统 (16进制表示)
const skillLevels = [
    "F", "E", "D", "C", "B", "A", 
    "9", "8", "7", "6", "5", "4", "3", "2", "1"
];

// 技能升级消耗的技能点
const skillUpgradeCost = {
    "F": 1, // F→E
    "E": 1, // E→D
    "D": 2, // D→C
    "C": 2, // C→B
    "B": 3, // B→A
    "A": 3, // A→9
    "9": 4, // 9→8
    "8": 4, // 8→7
    "7": 5, // 7→6
    "6": 5, // 6→5
    "5": 6, // 5→4
    "4": 6, // 4→3
    "3": 7, // 3→2
    "2": 8  // 2→1
};

// 技能解锁条件
const skillUnlockRequirements = {
    // 一级技能：需要前置技能达到D级或以上
    "tier1": "D",
    // 二级技能：需要前置技能达到B级或以上
    "tier2": "B",
    // 三级技能：需要前置技能达到9级或以上
    "tier3": "9"
};

// 技能类型数据
const skillTypeData = {
    melee: { name: "近战技能", icon: "⚔️", class: "warrior" },
    ranged: { name: "远程技能", icon: "🏹", class: "ranger" },
    magic: { name: "魔法技能", icon: "✨", class: "mage" }
};

// 近战技能数据
const meleeSkillData = {
    heavyStrike: {
        name: "重击",
        type: "passive",
        description: "{chance}%几率造成{damage}%伤害",
        baseChance: 10,
        baseDamage: 150,
        chancePerLevel: 5,
        damagePerLevel: 10,
        cooldown: 0,
        requiredSkill: null,
        tier: 0 // 初始技能
    },
    whirlwind: {
        name: "旋风斩",
        type: "active",
        description: "对敌人造成{damage}%伤害",
        baseDamage: 120,
        damagePerLevel: 10,
        cooldown: 3,
        requiredSkill: "heavyStrike",
        tier: 1
    },
    groundSmash: {
        name: "震地",
        type: "active",
        description: "对敌人造成{damage}%伤害并眩晕{stunDuration}回合",
        baseDamage: 100,
        damagePerLevel: 10,
        baseStunDuration: 1,
        stunDurationPerLevel: 0.2,
        cooldown: 5,
        requiredSkill: "whirlwind",
        tier: 2
    },
    battleCry: {
        name: "战吼",
        type: "active",
        description: "提升{atkBoost}%攻击力，持续{duration}回合",
        baseAtkBoost: 20,
        atkBoostPerLevel: 5,
        baseDuration: 3,
        durationPerLevel: 0.5,
        cooldown: 6,
        requiredSkill: "groundSmash",
        tier: 3
    },
    defensiveStance: {
        name: "防御姿态",
        type: "active",
        description: "减少{damageReduction}%受到的伤害，持续{duration}回合",
        baseDamageReduction: 30,
        damageReductionPerLevel: 5,
        baseDuration: 2,
        durationPerLevel: 0.5,
        cooldown: 4,
        requiredSkill: "heavyStrike",
        tier: 1
    },
    counterAttack: {
        name: "反击",
        type: "passive",
        description: "受到攻击后有{chance}%几率反击，造成{damage}%伤害",
        baseChance: 20,
        baseDamage: 80,
        chancePerLevel: 5,
        damagePerLevel: 10,
        cooldown: 0,
        requiredSkill: "defensiveStance",
        tier: 2
    },
    shieldCharge: {
        name: "盾牌冲锋",
        type: "active",
        description: "对敌人造成{damage}%伤害并减少{defReduction}%防御",
        baseDamage: 150,
        damagePerLevel: 10,
        baseDefReduction: 10,
        defReductionPerLevel: 2,
        cooldown: 4,
        requiredSkill: "counterAttack",
        tier: 3
    },
    invincible: {
        name: "无敌",
        type: "active",
        description: "免疫所有伤害{duration}回合",
        baseDuration: 1,
        durationPerLevel: 0.2,
        cooldown: 10,
        requiredSkill: "shieldCharge",
        tier: 3
    },
    lifeEnhancement: {
        name: "生命强化",
        type: "passive",
        description: "增加{hpBoost}%最大生命值",
        baseHpBoost: 15,
        hpBoostPerLevel: 5,
        cooldown: 0,
        requiredSkill: "heavyStrike",
        tier: 1
    },
    bloodthirst: {
        name: "嗜血",
        type: "passive",
        description: "攻击时有{chance}%几率恢复{hpRecovery}%最大生命值",
        baseChance: 15,
        baseHpRecovery: 5,
        chancePerLevel: 5,
        hpRecoveryPerLevel: 1,
        cooldown: 0,
        requiredSkill: "lifeEnhancement",
        tier: 2
    },
    berserk: {
        name: "狂暴",
        type: "active",
        description: "提升{atkBoost}%攻击力但减少{defReduction}%防御，持续{duration}回合",
        baseAtkBoost: 50,
        atkBoostPerLevel: 10,
        baseDefReduction: 20,
        baseDuration: 3,
        durationPerLevel: 0.5,
        cooldown: 8,
        requiredSkill: "bloodthirst",
        tier: 3
    }
};

// 远程技能数据
const rangedSkillData = {
    preciseShot: {
        name: "精准射击",
        type: "passive",
        description: "增加{critRate}%暴击率",
        baseCritRate: 15,
        critRatePerLevel: 3,
        cooldown: 0,
        requiredSkill: null,
        tier: 0 // 初始技能
    },
    doubleArrow: {
        name: "双重箭",
        type: "active",
        description: "连续射出两箭，每箭造成{damage}%伤害",
        baseDamage: 70,
        damagePerLevel: 5,
        cooldown: 3,
        requiredSkill: "preciseShot",
        tier: 1
    },
    tripleShot: {
        name: "三连射",
        type: "active",
        description: "连续射出三箭，每箭造成{damage}%伤害",
        baseDamage: 60,
        damagePerLevel: 5,
        cooldown: 4,
        requiredSkill: "doubleArrow",
        tier: 2
    },
    arrowRain: {
        name: "箭雨",
        type: "active",
        description: "造成{damage}%伤害，分5回合平均释放",
        baseDamage: 200,
        damagePerLevel: 20,
        cooldown: 8,
        requiredSkill: "tripleShot",
        tier: 3
    },
    poisonArrow: {
        name: "毒箭",
        type: "active",
        description: "造成{damage}%伤害并附加每回合{dotDamage}%伤害的中毒效果，持续3回合",
        baseDamage: 80,
        damagePerLevel: 5,
        baseDotDamage: 10,
        dotDamagePerLevel: 2,
        cooldown: 4,
        requiredSkill: "preciseShot",
        tier: 1
    },
    paralyzeArrow: {
        name: "麻痹箭",
        type: "active",
        description: "造成{damage}%伤害并有{chance}%几率使目标1回合无法行动",
        baseDamage: 70,
        damagePerLevel: 5,
        baseChance: 30,
        chancePerLevel: 5,
        cooldown: 5,
        requiredSkill: "poisonArrow",
        tier: 2
    },
    piercingArrow: {
        name: "穿透箭",
        type: "passive",
        description: "攻击无视目标{defPierce}%防御力",
        baseDefPierce: 15,
        defPiercePerLevel: 3,
        cooldown: 0,
        requiredSkill: "paralyzeArrow",
        tier: 3
    },
    explosiveArrow: {
        name: "爆炸箭",
        type: "active",
        description: "造成{damage}%伤害并有{chance}%几率造成额外{extraDamage}%伤害",
        baseDamage: 150,
        damagePerLevel: 10,
        baseChance: 20,
        chancePerLevel: 5,
        baseExtraDamage: 50,
        extraDamagePerLevel: 5,
        cooldown: 6,
        requiredSkill: "piercingArrow",
        tier: 3
    },
    agilityEnhancement: {
        name: "敏捷强化",
        type: "passive",
        description: "增加{agiBoost}%敏捷",
        baseAgiBoost: 15,
        agiBoostPerLevel: 5,
        cooldown: 0,
        requiredSkill: "preciseShot",
        tier: 1
    },
    evasion: {
        name: "闪避",
        type: "passive",
        description: "有{chance}%几率闪避敌人攻击",
        baseChance: 10,
        chancePerLevel: 2,
        cooldown: 0,
        requiredSkill: "agilityEnhancement",
        tier: 2
    },
    sprint: {
        name: "疾跑",
        type: "active",
        description: "提升{atkSpeedBoost}%攻击速度，持续{duration}回合",
        baseAtkSpeedBoost: 30,
        atkSpeedBoostPerLevel: 5,
        baseDuration: 3,
        durationPerLevel: 0.5,
        cooldown: 6,
        requiredSkill: "evasion",
        tier: 3
    }
};

// 魔法技能数据
const magicSkillData = {
    fireball: {
        name: "火球术",
        type: "active",
        description: "对敌人造成{damage}%魔法伤害",
        baseDamage: 120,
        damagePerLevel: 10,
        cooldown: 3,
        requiredSkill: null,
        tier: 0 // 初始技能
    },
    firewall: {
        name: "火墙",
        type: "active",
        description: "每回合造成{damage}%魔法伤害，持续{duration}回合",
        baseDamage: 40,
        damagePerLevel: 5,
        baseDuration: 3,
        durationPerLevel: 0.5,
        cooldown: 5,
        requiredSkill: "fireball",
        tier: 1
    },
    meteor: {
        name: "陨石",
        type: "active",
        description: "对敌人造成{damage}%魔法伤害",
        baseDamage: 200,
        damagePerLevel: 15,
        cooldown: 7,
        requiredSkill: "firewall",
        tier: 2
    },
    heavenlyFire: {
        name: "天火",
        type: "active",
        description: "对敌人造成{damage}%魔法伤害",
        baseDamage: 300,
        damagePerLevel: 20,
        cooldown: 10,
        requiredSkill: "meteor",
        tier: 3
    },
    iceArrow: {
        name: "冰箭",
        type: "active",
        description: "对敌人造成{damage}%魔法伤害并减少{slowEffect}%攻击速度",
        baseDamage: 100,
        damagePerLevel: 10,
        baseSlowEffect: 10,
        slowEffectPerLevel: 2,
        cooldown: 3,
        requiredSkill: "fireball",
        tier: 1
    },
    freeze: {
        name: "冰冻术",
        type: "active",
        description: "对敌人造成{damage}%魔法伤害并有{chance}%几率冰冻1回合",
        baseDamage: 80,
        damagePerLevel: 5,
        baseChance: 30,
        chancePerLevel: 5,
        cooldown: 5,
        requiredSkill: "iceArrow",
        tier: 2
    },
    blizzard: {
        name: "暴风雪",
        type: "active",
        description: "每回合造成{damage}%魔法伤害并减少{slowEffect}%攻击速度，持续{duration}回合",
        baseDamage: 50,
        damagePerLevel: 5,
        baseSlowEffect: 15,
        slowEffectPerLevel: 2,
        baseDuration: 3,
        durationPerLevel: 0.5,
        cooldown: 6,
        requiredSkill: "freeze",
        tier: 3
    },
    absoluteZero: {
        name: "绝对零度",
        type: "active",
        description: "对敌人造成{damage}%魔法伤害并冰冻{freezeDuration}回合",
        baseDamage: 150,
        damagePerLevel: 10,
        baseFreezeDuration: 2,
        freezeDurationPerLevel: 0.2,
        cooldown: 9,
        requiredSkill: "blizzard",
        tier: 3
    },
    manaEnhancement: {
        name: "魔力强化",
        type: "passive",
        description: "增加{mpBoost}%魔力",
        baseMpBoost: 15,
        mpBoostPerLevel: 5,
        cooldown: 0,
        requiredSkill: "fireball",
        tier: 1
    },
    manaRecovery: {
        name: "法力回复",
        type: "passive",
        description: "每回合恢复{mpRecovery}%最大法力值",
        baseMpRecovery: 5,
        mpRecoveryPerLevel: 1,
        cooldown: 0,
        requiredSkill: "manaEnhancement",
        tier: 2
    },
    magicShield: {
        name: "魔法护盾",
        type: "active",
        description: "创造一个可吸收等同于魔力{shieldStrength}%的伤害护盾，持续{duration}回合",
        baseShieldStrength: 50,
        shieldStrengthPerLevel: 10,
        baseDuration: 3,
        durationPerLevel: 0.5,
        cooldown: 7,
        requiredSkill: "manaRecovery",
        tier: 3
    }
};

for (const skill in meleeSkillData) {
    meleeSkillData[skill].skillType = "melee";
}
for (const skill in rangedSkillData) {
    rangedSkillData[skill].skillType = "ranged";
}
for (const skill in magicSkillData) {
    magicSkillData[skill].skillType = "magic";
}

// 合并所有技能数据
const skillData = {
    melee: meleeSkillData,
    ranged: rangedSkillData,
    magic: magicSkillData
};

typelessskillData = {
    ...meleeSkillData,
    ...rangedSkillData,
    ...magicSkillData
};

// 获取技能等级索引
function getSkillLevelIndex(level) {
    return skillLevels.indexOf(level);
}

// 获取下一个技能等级
function getNextSkillLevel(currentLevel) {
    const currentIndex = getSkillLevelIndex(currentLevel);
    if (currentIndex < skillLevels.length - 1) {
        return skillLevels[currentIndex + 1];
    }
    return currentLevel; // 已是最高等级
}

// 检查技能是否可以升级
function canUpgradeSkill(skillId, skillType, currentLevel, skillPoints) {
    // 检查是否已达到最高等级
    if (currentLevel === skillLevels[skillLevels.length - 1]) {
        return false;
    }
    
    // 检查技能点是否足够
    const cost = skillUpgradeCost[currentLevel];
    if (skillPoints < cost) {
        return false;
    }
    
    return true;
}

// 检查技能是否可以学习
function canLearnSkill(skillId, skillType, learnedSkills) {
    const skill = skillData[skillType][skillId];
    
    // 检查是否已学习
    if (learnedSkills[skillId]) {
        return false;
    }
    
    // 检查前置技能要求
    if (skill.requiredSkill) {
        // 检查前置技能是否已学习
        if (!learnedSkills[skill.requiredSkill]) {
            return false;
        }
        
        // 检查前置技能等级是否达到要求
        const requiredLevel = skillUnlockRequirements[`tier${skill.tier}`];
        const currentLevel = learnedSkills[skill.requiredSkill];
        
        if (getSkillLevelIndex(currentLevel) < getSkillLevelIndex(requiredLevel)) {
            return false;
        }
    }
    
    return true;
}

// 计算技能效果
function calculateSkillEffect(skillId, skillType, skillLevel) {
    // console.log(skillId);
    // console.log(skillType);
    const skill = skillData[skillType][skillId];
    const levelIndex = getSkillLevelIndex(skillLevel);

    const effect = {};
    
    // 根据技能类型计算不同效果
    switch (skillId) {
        // 近战技能
        case "heavyStrike":
            effect.chance = skill.baseChance + skill.chancePerLevel * levelIndex;
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            break;
        case "whirlwind":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            break;
        case "groundSmash":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            effect.stunDuration = skill.baseStunDuration + skill.stunDurationPerLevel * levelIndex;
            break;
        case "battleCry":
            effect.atkBoost = skill.baseAtkBoost + skill.atkBoostPerLevel * levelIndex;
            effect.duration = skill.baseDuration + skill.durationPerLevel * levelIndex;
            break;
        case "defensiveStance":
            effect.damageReduction = skill.baseDamageReduction + skill.damageReductionPerLevel * levelIndex;
            effect.duration = skill.baseDuration + skill.durationPerLevel * levelIndex;
            break;
        case "counterAttack":
            effect.chance = skill.baseChance + skill.chancePerLevel * levelIndex;
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            break;
        case "shieldCharge":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            effect.defReduction = skill.baseDefReduction + skill.defReductionPerLevel * levelIndex;
            break;
        case "invincible":
            effect.duration = skill.baseDuration + skill.durationPerLevel * levelIndex;
            break;
        case "lifeEnhancement":
            effect.hpBoost = skill.baseHpBoost + skill.hpBoostPerLevel * levelIndex;
            break;
        case "bloodthirst":
            effect.chance = skill.baseChance + skill.chancePerLevel * levelIndex;
            effect.hpRecovery = skill.baseHpRecovery + skill.hpRecoveryPerLevel * levelIndex;
            break;
        case "berserk":
            effect.atkBoost = skill.baseAtkBoost + skill.atkBoostPerLevel * levelIndex;
            effect.defReduction = skill.baseDefReduction;
            effect.duration = skill.baseDuration + skill.durationPerLevel * levelIndex;
            break;
            
        // 远程技能
        case "preciseShot":
            effect.critRate = skill.baseCritRate + skill.critRatePerLevel * levelIndex;
            break;
        case "doubleArrow":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            break;
        case "tripleShot":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            break;
        case "arrowRain":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            break;
        case "poisonArrow":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            effect.dotDamage = skill.baseDotDamage + skill.dotDamagePerLevel * levelIndex;
            break;
        case "paralyzeArrow":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            effect.chance = skill.baseChance + skill.chancePerLevel * levelIndex;
            break;
        case "piercingArrow":
            effect.defPierce = skill.baseDefPierce + skill.defPiercePerLevel * levelIndex;
            break;
        case "explosiveArrow":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            effect.chance = skill.baseChance + skill.chancePerLevel * levelIndex;
            effect.extraDamage = skill.baseExtraDamage + skill.extraDamagePerLevel * levelIndex;
            break;
        case "agilityEnhancement":
            effect.agiBoost = skill.baseAgiBoost + skill.agiBoostPerLevel * levelIndex;
            break;
        case "evasion":
            effect.chance = skill.baseChance + skill.chancePerLevel * levelIndex;
            break;
        case "sprint":
            effect.atkSpeedBoost = skill.baseAtkSpeedBoost + skill.atkSpeedBoostPerLevel * levelIndex;
            effect.duration = skill.baseDuration + skill.durationPerLevel * levelIndex;
            break;
            
        // 魔法技能
        case "fireball":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            break;
        case "firewall":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            effect.duration = skill.baseDuration + skill.durationPerLevel * levelIndex;
            break;
        case "meteor":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            break;
        case "heavenlyFire":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            break;
        case "iceArrow":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            effect.slowEffect = skill.baseSlowEffect + skill.slowEffectPerLevel * levelIndex;
            break;
        case "freeze":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            effect.chance = skill.baseChance + skill.chancePerLevel * levelIndex;
            break;
        case "blizzard":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            effect.slowEffect = skill.baseSlowEffect + skill.slowEffectPerLevel * levelIndex;
            effect.duration = skill.baseDuration + skill.durationPerLevel * levelIndex;
            break;
        case "absoluteZero":
            effect.damage = skill.baseDamage + skill.damagePerLevel * levelIndex;
            effect.freezeDuration = skill.baseFreezeDuration + skill.freezeDurationPerLevel * levelIndex;
            break;
        case "manaEnhancement":
            effect.mpBoost = skill.baseMpBoost + skill.mpBoostPerLevel * levelIndex;
            break;
        case "manaRecovery":
            effect.mpRecovery = skill.baseMpRecovery + skill.mpRecoveryPerLevel * levelIndex;
            break;
        case "magicShield":
            effect.shieldStrength = skill.baseShieldStrength + skill.shieldStrengthPerLevel * levelIndex;
            effect.duration = skill.baseDuration + skill.durationPerLevel * levelIndex;
            break;
    }
    
    return effect;
}

// 获取技能描述文本
function getSkillDescription(skillId, skillType, skillLevel) {
    const skill = skillData[skillType][skillId];
    const effect = calculateSkillEffect(skillId, skillType, skillLevel);
    
    let description = skill.description;
    
    // 替换描述中的变量
    for (const key in effect) {
        const value = effect[key];
        description = description.replace(`{${key}}`, Math.round(value * 10) / 10);
    }
    
    return description;
}

// 应用技能效果到玩家属性
function applyPassiveSkillEffects(player, learnedSkills) {
    // 重置属性加成
    const bonuses = {
        atk: 0,
        def: 0,
        hp: 0,
        mp: 0,
        agi: 0,
        critRate: 0,
        critDamage: 0,
        defPierce: 0,
        evasion: 0
    };
    
    // 根据职业确定技能类型
    let skillType;
    switch (player.class) {
        case "warrior":
            skillType = "melee";
            break;
        case "ranger":
            skillType = "ranged";
            break;
        case "mage":
            skillType = "magic";
            break;
    }
    
    // 应用被动技能效果
    for (const skillId in learnedSkills) {
        const skillLevel = learnedSkills[skillId];
        const skill = skillData[skillType][skillId];
        
        // 跳过非被动技能
        if (skill && skill.type !== "passive") continue;
        
        const effect = calculateSkillEffect(skillId, skillType, skillLevel);
        
        // 根据技能ID应用不同效果
        switch (skillId) {
            // 近战被动技能
            case "heavyStrike":
                // 这是一个特殊的被动技能，在战斗中处理
                break;
            case "counterAttack":
                // 这是一个特殊的被动技能，在战斗中处理
                break;
            case "lifeEnhancement":
                bonuses.hp += effect.hpBoost;
                break;
            case "bloodthirst":
                // 这是一个特殊的被动技能，在战斗中处理
                break;
                
            // 远程被动技能
            case "preciseShot":
                bonuses.critRate += effect.critRate;
                break;
            case "piercingArrow":
                bonuses.defPierce += effect.defPierce;
                break;
            case "agilityEnhancement":
                bonuses.agi += effect.agiBoost;
                break;
            case "evasion":
                bonuses.evasion += effect.chance;
                break;
                
            // 魔法被动技能
            case "manaEnhancement":
                bonuses.mp += effect.mpBoost;
                break;
            case "manaRecovery":
                // 这是一个特殊的被动技能，在战斗中处理
                break;
        }
    }
    
    return bonuses;
}

// 初始化技能系统
function initSkillSystem() {
    // 如果游戏状态中没有技能数据，则初始化
    if (!gameState.skills) {
        gameState.skills = {
            learned: {},
            activeSkill: null,
            skillPoints: gameState.player.level, // 初始技能点等于角色等级
            cooldowns: {}
        };
        
        // 根据职业添加初始技能
        switch (gameState.player.class) {
            case "warrior":
                gameState.skills.learned.heavyStrike = "F";
                gameState.skills.activeSkill = "heavyStrike";
                break;
            case "ranger":
                gameState.skills.learned.preciseShot = "F";
                gameState.skills.activeSkill = "preciseShot";
                break;
            case "mage":
                gameState.skills.learned.fireball = "F";
                gameState.skills.activeSkill = "fireball";
                break;
        }
    }
}

// 更新技能面板
function updateSkillPanel() {
    // 获取技能类型
    let skillType;
    switch (gameState.player.class) {
        case "warrior":
            skillType = "melee";
            break;
        case "ranger":
            skillType = "ranged";
            break;
        case "mage":
            skillType = "magic";
            break;
    }
    
    // 更新技能点显示
    document.getElementById('skill-points').textContent = gameState.skills.skillPoints;
    
    // 更新激活技能显示
    const activeSkillElement = document.getElementById('active-skill');
    if (gameState.skills.activeSkill) {
        const activeSkill = skillData[skillType][gameState.skills.activeSkill];
        const activeSkillLevel = gameState.skills.learned[gameState.skills.activeSkill];
        const activeSkillEffect = calculateSkillEffect(gameState.skills.activeSkill, skillType, activeSkillLevel);
        
        let html = `
            <div class="skill-icon">${skillTypeData[skillType].icon}</div>
            <div class="skill-info">
                <div class="skill-name">${activeSkill.name} <span class="skill-level">[${activeSkillLevel}]</span></div>
                <div class="skill-type">${activeSkill.type === "active" ? "主动技能" : "被动技能"}</div>
                <div class="skill-description">${getSkillDescription(gameState.skills.activeSkill, skillType, activeSkillLevel)}</div>
        `;
        
        if (activeSkill.type === "active") {
            html += `<div class="skill-cooldown">冷却时间: ${activeSkill.cooldown} 回合</div>`;
        }
        
        html += `</div>`;
        
        activeSkillElement.innerHTML = html;
    } else {
        activeSkillElement.innerHTML = "<div class='no-skill'>未选择技能</div>";
    }
    
    // 更新技能树
    updateSkillTree(skillType);
}

// 更新技能树
function updateSkillTree(skillType) {
    const skillTreeElement = document.getElementById(skillType + '-skill-tree');
    skillTreeElement.innerHTML = "";
    
    // 创建技能树结构
    const skillsData = skillData[skillType];
    
    // 按层级组织技能
    const tiers = {};
    for (const skillId in skillsData) {
        const skill = skillsData[skillId];
        if (!tiers[skill.tier]) {
            tiers[skill.tier] = [];
        }
        tiers[skill.tier].push(skillId);
    }
    
    // 创建技能树HTML
    for (let tier = 0; tier <= 3; tier++) {
        if (!tiers[tier]) continue;
        
        const tierElement = document.createElement('div');
        tierElement.className = `skill-tier tier-${tier}`;
        
        for (const skillId of tiers[tier]) {
            const skill = skillsData[skillId];
            const skillElement = document.createElement('div');
            skillElement.className = 'skill-item';
            
            // 检查技能是否已学习
            const isLearned = gameState.skills.learned[skillId];
            if (isLearned) {
                skillElement.classList.add('learned');
                
                // 检查是否是当前激活的技能
                if (gameState.skills.activeSkill === skillId) {
                    skillElement.classList.add('active');
                }
                
                // 检查是否可以升级
                if (canUpgradeSkill(skillId, skillType, isLearned, gameState.skills.skillPoints)) {
                    skillElement.classList.add('can-upgrade');
                }
            } else {
                // 检查是否可以学习
                if (canLearnSkill(skillId, skillType, gameState.skills.learned)) {
                    skillElement.classList.add('can-learn');
                } else {
                    skillElement.classList.add('locked');
                }
            }
            
            // 创建技能图标和名称
            skillElement.innerHTML = `
                <div class="skill-icon">${skillTypeData[skillType].icon}</div>
                <div class="skill-name">${skill.name}</div>
                ${isLearned ? `<div class="skill-level">${isLearned}</div>` : ''}
            `;
            
            // 添加点击事件
            skillElement.addEventListener('click', () => {
                showSkillDetails(skillId, skillType);
            });
            
            // 添加到层级元素
            tierElement.appendChild(skillElement);
        }
        
        // 添加到技能树
        skillTreeElement.appendChild(tierElement);
    }
}

// 显示技能详情
function showSkillDetails(skillId, skillType) {
    const skill = skillData[skillType][skillId];
    const isLearned = gameState.skills.learned[skillId];
    
    // 创建技能详情弹窗
    const detailsElement = document.createElement('div');
    detailsElement.className = 'skill-details-popup';
    
    let html = `
        <div class="skill-details-header">
            <div class="skill-icon">${skillTypeData[skillType].icon}</div>
            <div class="skill-title">
                <div class="skill-name">${skill.name}</div>
                <div class="skill-type">${skill.type === "active" ? "主动技能" : "被动技能"}</div>
            </div>
            <button class="close-details">×</button>
        </div>
        <div class="skill-details-content">
    `;
    
    if (isLearned) {
        // 已学习技能
        const effect = calculateSkillEffect(skillId, skillType, isLearned);
        html += `
            <div class="skill-level-info">当前等级: ${isLearned}</div>
            <div class="skill-description">${getSkillDescription(skillId, skillType, isLearned)}</div>
        `;
        
        if (skill.type === "active") {
            html += `<div class="skill-cooldown">冷却时间: ${skill.cooldown} 回合</div>`;
        }
        
        // 显示下一级信息（如果可以升级）
        if (isLearned !== skillLevels[skillLevels.length - 1]) {
            const nextLevel = getNextSkillLevel(isLearned);
            html += `
                <div class="skill-next-level">
                    <div class="next-level-header">下一级 (${nextLevel}):</div>
                    <div class="next-level-description">${getSkillDescription(skillId, skillType, nextLevel)}</div>
                    <div class="upgrade-cost">升级消耗: ${skillUpgradeCost[isLearned]} 技能点</div>
                </div>
            `;
        }
        
        // 添加按钮
        html += `<div class="skill-actions">`;
        
        // 激活按钮（仅对主动技能）
        if (skill.type === "active") {
            if (gameState.skills.activeSkill === skillId) {
                html += `<button class="skill-action-button" id="btn-activate" disabled>当前已激活</button>`;
            } else {
                html += `<button class="skill-action-button" id="btn-activate">激活技能</button>`;
            }
        }
        
        // 升级按钮
        if (canUpgradeSkill(skillId, skillType, isLearned, gameState.skills.skillPoints)) {
            html += `<button class="skill-action-button" id="btn-upgrade">升级技能</button>`;
        } else if (isLearned !== skillLevels[skillLevels.length - 1]) {
            html += `<button class="skill-action-button" id="btn-upgrade" disabled>技能点不足</button>`;
        } else {
            html += `<button class="skill-action-button" id="btn-upgrade" disabled>已达最高等级</button>`;
        }
        
        html += `</div>`;
    } else {
        // 未学习技能
        html += `
            <div class="skill-description">${getSkillDescription(skillId, skillType, "F")}</div>
        `;
        
        if (skill.type === "active") {
            html += `<div class="skill-cooldown">冷却时间: ${skill.cooldown} 回合</div>`;
        }
        
        // 显示学习条件
        html += `<div class="skill-requirements">学习条件:</div>`;
        
        if (skill.requiredSkill) {
            const requiredSkill = skillData[skillType][skill.requiredSkill];
            const requiredLevel = skillUnlockRequirements[`tier${skill.tier}`];
            html += `<div class="required-skill">${requiredSkill.name} 达到 ${requiredLevel} 级</div>`;
        } else {
            html += `<div class="required-skill">初始技能</div>`;
        }
        
        // 添加学习按钮
        html += `<div class="skill-actions">`;
        if (canLearnSkill(skillId, skillType, gameState.skills.learned)) {
            if (gameState.skills.skillPoints >= 1) {
                html += `<button class="skill-action-button" id="btn-learn">学习技能 (消耗1技能点)</button>`;
            } else {
                html += `<button class="skill-action-button" id="btn-learn" disabled>技能点不足</button>`;
            }
        } else {
            html += `<button class="skill-action-button" id="btn-learn" disabled>无法学习</button>`;
        }
        html += `</div>`;
    }
    
    html += `</div>`; // 关闭 skill-details-content
    
    detailsElement.innerHTML = html;
    
    // 添加事件监听
    document.body.appendChild(detailsElement);
    
    // 关闭按钮
    detailsElement.querySelector('.close-details').addEventListener('click', () => {
        document.body.removeChild(detailsElement);
    });
    
    // 激活按钮
    const activateBtn = detailsElement.querySelector('#btn-activate');
    if (activateBtn) {
        activateBtn.addEventListener('click', () => {
            activateSkill(skillId);
            document.body.removeChild(detailsElement);
            updateSkillPanel();
        });
    }
    
    // 升级按钮
    console.log(detailsElement);
    const upgradeBtn = detailsElement.querySelector('#btn-upgrade');
    console.log(upgradeBtn);
    if (upgradeBtn && !upgradeBtn.disabled) {
        upgradeBtn.addEventListener('click', () => {
            upgradeSkill(skillId, skillType);
            document.body.removeChild(detailsElement);
            updateSkillPanel();
        });
    }
    
    // 学习按钮
    const learnBtn = detailsElement.querySelector('#btn-learn');
    if (learnBtn && !learnBtn.disabled) {
        learnBtn.addEventListener('click', () => {
            learnSkill(skillId, skillType);
            document.body.removeChild(detailsElement);
            updateSkillPanel();
        });
    }
}

// 激活技能
function activateSkill(skillId) {
    gameState.skills.activeSkill = skillId;
    gameState.skills.cooldowns[skillId] = 0;
    logMessage(`激活技能: ${skillData[getPlayerSkillType()][skillId].name}`);
    saveGame();
}

// 升级技能
function upgradeSkill(skillId, skillType) {
    const currentLevel = gameState.skills.learned[skillId];
    const cost = skillUpgradeCost[currentLevel];
    
    // 扣除技能点
    gameState.skills.skillPoints -= cost;
    
    // 提升技能等级
    gameState.skills.learned[skillId] = getNextSkillLevel(currentLevel);
    
    // 更新玩家属性（应用被动技能效果）
    updatePlayerStats();
    
    logMessage(`升级技能: ${skillData[skillType][skillId].name} 到 ${gameState.skills.learned[skillId]} 级`);
    saveGame();
}

// 学习技能
function learnSkill(skillId, skillType) {
    // 扣除技能点
    gameState.skills.skillPoints -= 1;
    
    // 添加技能
    gameState.skills.learned[skillId] = "F";
    
    // 如果是第一个技能，自动激活
    if (!gameState.skills.activeSkill && skillData[skillType][skillId].type === "active") {
        gameState.skills.activeSkill = skillId;
    }
    
    // 更新玩家属性（应用被动技能效果）
    updatePlayerStats();
    
    logMessage(`学习技能: ${skillData[skillType][skillId].name}`);
    saveGame();
}

// 获取玩家技能类型
function getPlayerSkillType() {
    switch (gameState.player.class) {
        case "warrior": return "melee";
        case "ranger": return "ranged";
        case "mage": return "magic";
        default: return "melee";
    }
}

// 在战斗中使用技能
function useSkillInBattle() {
    if (!gameState.skills.activeSkill) return null;
    
    const skillType = getPlayerSkillType();
    const skillId = gameState.skills.activeSkill;
    const skill = skillData[skillType][skillId];
    
    // 检查是否是被动技能
    if (skill.type === "passive") return null;
    
    // 检查冷却时间
    if (gameState.skills.cooldowns[skillId] > 0) {
        return null;
    }
    
    // 计算技能效果
    const skillLevel = gameState.skills.learned[skillId];
    const effect = calculateSkillEffect(skillId, skillType, skillLevel);
    
    // 设置冷却时间
    gameState.skills.cooldowns[skillId] = skill.cooldown;
    
    return {
        skillId,
        skillName: skill.name,
        effect
    };
}

// 处理技能冷却
function processSkillCooldowns() {
    for (const skillId in gameState.skills.cooldowns) {
        if (gameState.skills.cooldowns[skillId] > 0) {
            gameState.skills.cooldowns[skillId]--;
        }
    }
}

// 导出函数
window.skillSystem = {
    initSkillSystem,
    updateSkillPanel,
    useSkillInBattle,
    processSkillCooldowns,
    applyPassiveSkillEffects
};