// 游戏状态
let gameState = {
    player: {
        level: 1,
        exp: 0,
        class: "warrior",
        stats: { hp: 100, maxHp: 100, atk: 10, def: 5, mp: 0, maxMp:0, agi: 3, critRate: 5, critDamage: 1.5 },
        equipment: {
            weapon: null,
            helmet: null,
            armor: null,
            legs: null,
            boots: null
        }
    },
    inventory: {
        equipment: [],
        gold: 0,
        petEggs: [],
        filters: {
            slot: 'all',
            rarity: 'all',
            affix: 'all'
        },
        sort: 'none',
        discardMode: false
    },

    pets: [], // 拥有的魔宠列表
    petEggs: [], // 拥有的魔宠蛋列表
    activePet: null, // 当前出战的魔宠索引
    releaseMode: false, // 魔宠放生模式

    skills: {
        learned: {},
        activeSkill: null,
        skillPoints: 0,
        cooldowns: {}
    },

    currentStage: "plains_1",
    battleState: {
        inBattle: false,
        currentEnemy: null,
        battleProgress: 0,
        killCount: 0,
        stunDuration: 0,       // 眩晕持续时间
        dotDamage: 0,          // 持续伤害值
        dotDuration: 0,        // 持续伤害持续时间
        atkBoost: 0,           // 攻击力提升百分比
        atkBoostDuration: 0,   // 攻击力提升持续时间
        damageReduction: 0,    // 伤害减免百分比
        damageReductionDuration: 0, // 伤害减免持续时间
        shield: 0,             // 护盾值
        shieldDuration: 0,     // 护盾持续时间
        slowAmount: 0          // 减速百分比
    },
    idleTime: 0,
    startTime: Date.now()
};

// DOM元素引用
const elements = {
    characterLevel: document.getElementById('character-level'),
    characterClass: document.getElementById('character-class'),
    expProgress: document.getElementById('exp-progress'),
    expText: document.getElementById('exp-text'),
    currentHp: document.getElementById('current-hp'),
    maxHp: document.getElementById('max-hp'),
    stageName: document.getElementById('stage-name'),
    recommendedLevel: document.getElementById('recommended-level'),
    monsterType: document.getElementById('monster-type'),
    battleProgress: document.getElementById('battle-progress'),
    idleTime: document.getElementById('idle-time'),
    logContent: document.getElementById('log-content'),
    autoScroll: document.getElementById('auto-scroll'),
    equipmentPanel: document.getElementById('equipment-panel'),
    stagesPanel: document.getElementById('stages-panel'),
    inventory: document.getElementById('inventory'),
    stageList: document.getElementById('stage-list'),
    statAtk: document.getElementById('stat-atk'),
    statDef: document.getElementById('stat-def'),
    statHp: document.getElementById('stat-hp'),
    statMp: document.getElementById('stat-mp'),
    statAgi: document.getElementById('stat-agi'),
    statCritRate: document.getElementById('stat-crit-rate'),
    statCritDamage: document.getElementById('stat-crit-damage'),
    statsPanel: document.getElementById('stats-panel'),
    statsToggle: document.getElementById('stats-toggle'),
    petsPanel: document.getElementById('pets-panel'),
    petTabs: document.querySelectorAll('.pet-tab'),
    petTabContents: document.querySelectorAll('.pet-tab-content'),
    activePet: document.getElementById('active-pet'),
    petList: document.getElementById('pet-list'),
    petEggList: document.getElementById('pet-egg-list'),
    filterSlot: document.getElementById('filter-slot'),
    filterRarity: document.getElementById('filter-rarity'),
    filterAffix: document.getElementById('filter-affix'),
    sortBy: document.getElementById('sort-by'),
    btnDiscardMode: document.getElementById('btn-discard-mode'),
    discardModeControls: document.getElementById('discard-mode-controls'),
    btnDiscardSelected: document.getElementById('btn-discard-selected'),
    btnSelectAll: document.getElementById('btn-select-all'),
    btnCancelDiscard: document.getElementById('btn-cancel-discard'),
    skillsPanel: document.getElementById('skills-panel'),
    skillTabs: document.querySelectorAll('.skill-tab'),
    skillTabContents: document.querySelectorAll('.skill-tab-content'),
    activeSkill: document.getElementById('active-skill'),
    skillPoints: document.getElementById('skill-points'),
    meleeSkillTree: document.getElementById('melee-skill-tree'),
    rangedSkillTree: document.getElementById('ranged-skill-tree'),
    magicSkillTree: document.getElementById('magic-skill-tree'),
};

// 初始化游戏
function initGame() {
    // 加载存档
    loadGame();
    
    // 更新UI
    updateUI();
    
    // 初始化装备面板
    initEquipmentPanel();

    // 初始化魔宠面板
    initPetsPanel();
    
    // 初始化关卡选择面板
    initStagesPanel();

    // 初始化技能面板
    initSkillsPanel();
    
    // 绑定按钮事件
    bindEvents();
    
    // 开始游戏循环
    startGameLoop();
    
    // 检查是否已在战斗中，如果是则恢复战斗循环
    if (gameState.battleState.inBattle && gameState.battleState.currentEnemy) {
        logMessage("恢复战斗...");
        // 直接调用battleLoop恢复战斗
        battleLoop();
    } else {
        // 不在战斗中，开始新战斗
        gameState.battleState.inBattle = false; // 确保状态正确
        startBattle();
    }
}

// 加载存档
function loadGame() {
    const savedGame = localStorage.getItem('eternalTower_save');
    if (savedGame) {
        try {
            gameState = JSON.parse(savedGame);
            logMessage("游戏存档已加载");
        } catch (e) {
            logMessage("存档加载失败，使用新游戏");
        }
    } else {
        logMessage("欢迎来到永恒之塔！");
    }
}

// 保存游戏
function saveGame() {
    localStorage.setItem('eternalTower_save', JSON.stringify(gameState));
}

// 更新UI
function updateUI() {
    elements.characterLevel.textContent = `Lv.${gameState.player.level}`;
    elements.characterClass.textContent = classData[gameState.player.class].name;
    elements.currentHp.textContent = Math.floor(gameState.player.stats.hp);
    elements.maxHp.textContent = Math.floor(gameState.player.stats.maxHp);
    
    // 更新经验值进度条
    const expNeeded = getExpForLevel(gameState.player.level);
    const expProgress = (gameState.player.exp / expNeeded) * 100;
    document.getElementById('exp-progress').style.width = `${expProgress}%`;
    document.getElementById('exp-text').textContent = `${gameState.player.exp}/${expNeeded}`;

    const currentStage = stageData.find(stage => stage.id === gameState.currentStage);
    elements.stageName.textContent = currentStage.name;
    elements.recommendedLevel.textContent = currentStage.recommendedLevel;
    
    if (gameState.battleState.currentEnemy) {
        elements.monsterType.textContent = gameState.battleState.currentEnemy.name;
    }
    
    elements.battleProgress.style.width = `${gameState.battleState.battleProgress}%`;
    
    // 更新挂机时间
    const totalSeconds = Math.floor(gameState.idleTime);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    elements.idleTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // 更新属性面板
    updateStatsPanel();
}

// 记录战斗日志
function logMessage(message) {
    const logEntry = document.createElement('p');
    const timestamp = new Date().toLocaleTimeString();
    logEntry.innerHTML = `[${timestamp}] ${message}`;
    elements.logContent.appendChild(logEntry);
    
    // 检查是否启用了自动滚动
    const autoScroll = document.getElementById('auto-scroll').checked;
    if (autoScroll) {
        elements.logContent.scrollTop = elements.logContent.scrollHeight;
    }
    
    // 限制日志条目数量
    while (elements.logContent.children.length > 100) {
        elements.logContent.removeChild(elements.logContent.firstChild);
    }
}

// 初始化装备面板
function initEquipmentPanel() {
    // 更新已装备物品
    for (const slot in gameState.player.equipment) {
        const equippedItem = gameState.player.equipment[slot];
        const slotElement = document.getElementById(`equipped-${slot}`);
        
        if (equippedItem) {
            slotElement.innerHTML = generateEquipmentHTML(equippedItem);
            slotElement.className = equippedItem.rarity;
        } else {
            slotElement.textContent = "空";
            slotElement.className = "";
        }
    }
    
    // 更新背包
    updateInventory();
}

// 更新背包
function updateInventory() {
    elements.inventory.innerHTML = "";
    
    // 应用筛选
    let filteredItems = gameState.inventory.equipment.filter(item => {
        // 筛选部位
        if (gameState.inventory.filters.slot !== 'all' && item.type !== gameState.inventory.filters.slot) {
            return false;
        }
        
        // 筛选品质
        if (gameState.inventory.filters.rarity !== 'all' && item.rarity !== gameState.inventory.filters.rarity) {
            return false;
        }
        
        // 筛选词条
        if (gameState.inventory.filters.affix !== 'all') {
            // 检查物品是否有指定词条
            if (!item.affixes || !item.affixes.some(affix => affix.id === gameState.inventory.filters.affix)) {
                return false;
            }
        }
        
        return true;
    });
    
    // 应用排序
    if (gameState.inventory.sort !== 'none') {
        filteredItems.sort((a, b) => {
            switch (gameState.inventory.sort) {
                case 'mainStat':
                    // 根据主属性排序（攻击力、防御力或生命值）
                    const getMainStat = (item) => {
                        if (item.type === 'weapon') return item.stats.atk || 0;
                        if (item.type === 'armor' || item.type === 'helmet') return item.stats.def || 0;
                        return item.stats.hp || 0;
                    };
                    return getMainStat(b) - getMainStat(a); // 从高到低
                
                case 'rarity':
                    // 根据品质排序
                    const rarityOrder = {
                        'legendary': 5,
                        'epic': 4,
                        'rare': 3,
                        'uncommon': 2,
                        'common': 1
                    };
                    return rarityOrder[b.rarity] - rarityOrder[a.rarity]; // 从高到低
                
                case 'newest':
                    // 假设物品有一个index属性表示获得顺序
                    // 如果没有，可以使用数组索引作为替代
                    const indexA = gameState.inventory.equipment.indexOf(a);
                    const indexB = gameState.inventory.equipment.indexOf(b);
                    return indexB - indexA; // 从新到旧
            }
        });
    }
    
    // 显示筛选后的物品
    filteredItems.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = `inventory-item ${item.rarity}`;
        if (gameState.inventory.discardMode) {
            itemElement.classList.add('discard-mode');
            if (item.selected) {
                itemElement.classList.add('selected');
            }
        }
        itemElement.innerHTML = generateEquipmentHTML(item);
        itemElement.dataset.index = gameState.inventory.equipment.indexOf(item); // 使用原始索引
        
        if (gameState.inventory.discardMode) {
            // 在丢弃模式下，点击物品会选中/取消选中
            itemElement.addEventListener('click', () => {
                item.selected = !item.selected;
                updateInventory(); // 刷新显示
            });
        } else {
            // 正常模式下，点击物品会装备
            itemElement.addEventListener('click', () => {
                equipItem(parseInt(itemElement.dataset.index));
            });
        }
        
        elements.inventory.appendChild(itemElement);
    });
}

// 生成装备HTML
function generateEquipmentHTML(item) {
    let html = `<div class="item-name">${rarityData[item.rarity].name} ${equipmentTypes[item.type].name}</div>`;
    
    // 基础属性
    if (item.stats.atk) html += `<div>攻击力: +${item.stats.atk}</div>`;
    if (item.stats.def) html += `<div>防御力: +${item.stats.def}</div>`;
    if (item.stats.hp) html += `<div>生命值: +${item.stats.hp}</div>`;
    
    // 词条
    if (item.affixes && item.affixes.length > 0) {
        html += `<div class="item-affixes">`;
        item.affixes.forEach(affix => {
            if (affix.type === "percent") {
                html += `<div>+${affix.value}% ${affixData[affix.id].name}</div>`;
            } else if (affix.type === "flat") {
                html += `<div>+${affix.value} ${affixData[affix.id].name}</div>`;
            } else {
                const description = affixData[affix.id].description.replace('{value}', affix.value);
                html += `<div>${description}</div>`;
            }
        });
        html += `</div>`;
    }
    
    return html;
}

// 装备物品
function equipItem(inventoryIndex) {
    const item = gameState.inventory.equipment[inventoryIndex];
    const oldItem = gameState.player.equipment[item.type];
    
    // 装备新物品
    gameState.player.equipment[item.type] = item;
    
    // 移除背包中的物品
    gameState.inventory.equipment.splice(inventoryIndex, 1);
    
    // 如果有旧物品，添加到背包
    if (oldItem) {
        gameState.inventory.equipment.push(oldItem);
    }
    
    // 更新玩家属性
    updatePlayerStats();
    
    // 更新UI
    initEquipmentPanel();
    updateUI();
    
    logMessage(`装备了 ${rarityData[item.rarity].name} ${equipmentTypes[item.type].name}`);
}

// 更新玩家属性
function updatePlayerStats() {
    const playerClass = classData[gameState.player.class];
    
    // 基础属性
    const baseStats = {
        hp: playerClass.baseStats.hp + playerClass.growthStats.hp * (gameState.player.level - 1),
        atk: playerClass.baseStats.atk + playerClass.growthStats.atk * (gameState.player.level - 1),
        def: playerClass.baseStats.def + playerClass.growthStats.def * (gameState.player.level - 1),
        mp: playerClass.baseStats.mp + playerClass.growthStats.mp * (gameState.player.level - 1),
        agi: playerClass.baseStats.agi + playerClass.growthStats.agi * (gameState.player.level - 1),
        critRate: 5,
        critDamage: 1.5
    };
    
    // 装备加成
    const equipStats = { hp: 0, atk: 0, def: 0, mp: 0, agi: 0, critRate: 0, critDamage: 0 };
    const percentBonuses = { hp: 0, atk: 0, def: 0, mp: 0, agi: 0 };
    
    for (const slot in gameState.player.equipment) {
        const item = gameState.player.equipment[slot];
        if (!item) continue;
        
        // 基础属性加成
        if (item.stats.atk) equipStats.atk += item.stats.atk;
        if (item.stats.def) equipStats.def += item.stats.def;
        if (item.stats.hp) equipStats.hp += item.stats.hp;
        
        // 词条加成
        if (item.affixes) {
            item.affixes.forEach(affix => {
                const affixInfo = affixData[affix.id];
                if (affix.type === "percent") {
                    percentBonuses[affixInfo.stat] += affix.value;
                } else if (affix.type === "flat") {
                    equipStats[affixInfo.stat] += affix.value;
                }
            });
        }
    }

    // 计算魔宠提供的属性加成
    let petBonusStats = {
        atk: 0,
        hp: 0,
        def: 0,
        critRate: 0,
        critDamage: 0,
        dropRate: 0,
        goldFind: 0,
        expFind: 0
    };
    
    if (gameState.activePet !== null && gameState.pets[gameState.activePet]) {
        petBonusStats = getPetBonusStats(gameState.pets[gameState.activePet]);
    }

    // 计算最终属性
    gameState.player.stats = {
        atk: baseStats.atk  + petBonusStats.atk + equipStats.atk,
        def: baseStats.def  + petBonusStats.def + equipStats.def,
        maxHp: baseStats.hp + petBonusStats.hp + equipStats.hp,
        hp: baseStats.hp + petBonusStats.hp + equipStats.hp,
        mp: baseStats.mp + equipStats.mp,
        agi: baseStats.agi + equipStats.agi,
        critRate: baseStats.critRate + equipStats.critRate + petBonusStats.critRate,
        critDamage: baseStats.critDamage + equipStats.critDamage + petBonusStats.critDamage,
        dropRate: petBonusStats.dropRate || 0,
        goldFind: petBonusStats.goldFind || 0,
        expFind: petBonusStats.expFind || 0
    };

    // 技能加成
    for (const skillId in gameState.skills.learned) {
        const skillLevel = gameState.skills.learned[skillId];
        
        // 处理被动技能加成
        if (typelessskillData[skillId].category === 'passive') {
            const effect = calculateSkillEffect(skillId, skillLevel);
            
            switch (skillId) {
                case "heavyStrike":
                    // 重击不直接影响属性
                    break;
                case "preciseShot":
                    // 增加暴击率
                    baseStats.critRate += effect.critRate;
                    break;
                // 可以添加更多被动技能效果
            }
        }
    }
    
    // 更新属性面板
    updateStatsPanel();
}

// 更新属性面板
function updateStatsPanel() {
    elements.statAtk.textContent = Math.floor(gameState.player.stats.atk);
    elements.statDef.textContent = Math.floor(gameState.player.stats.def);
    elements.statHp.textContent = Math.floor(gameState.player.stats.maxHp);
    elements.statMp.textContent = Math.floor(gameState.player.stats.mp);
    elements.statAgi.textContent = Math.floor(gameState.player.stats.agi);
    elements.statCritRate.textContent = gameState.player.stats.critRate + '%';
    elements.statCritDamage.textContent = (gameState.player.stats.critDamage * 100) + '%';
}

function initPetsPanel() {
    // if (!gameState.pets) gameState.pets = [];
    // if (!gameState.petEggs) gameState.petEggs = [];
    // if (gameState.activePet === undefined) gameState.activePet = null;
    // 初始化放生模式状态
    if (gameState.releaseMode === undefined) gameState.releaseMode = false;
    updatePetsPanel();
}

// 更新魔宠面板
function updatePetsPanel() {
    // 更新出战魔宠
    updateActivePet();
    
    // 更新魔宠列表
    updatePetList();
    
    // 更新魔宠蛋列表
    updatePetEggList();
    
    // 添加放生按钮和控制区域
    const myPetsContent = document.getElementById('my-pets-content');
    
    // 移除旧的放生控制区域（如果存在）
    const oldReleaseControls = document.getElementById('pet-release-controls');
    if (oldReleaseControls) {
        oldReleaseControls.remove();
    }
    
    // 创建放生控制区域
    const releaseControls = document.createElement('div');
    releaseControls.id = 'pet-release-controls';
    releaseControls.className = 'pet-release-controls';
    
    if (!gameState.releaseMode) {
        // 非放生模式下，只显示放生按钮
        releaseControls.innerHTML = `
            <button id="btn-release-mode" class="pet-action-button release">放生</button>
        `;
    } else {
        // 放生模式下，显示放生选中和取消按钮
        releaseControls.innerHTML = `
            <button id="btn-release-selected" class="pet-action-button release">放生选中魔宠</button>
            <button id="btn-cancel-release" class="pet-action-button cancel">取消</button>
        `;
    }
    
    // 将控制区域插入到魔宠列表前面
    const petListHeading = myPetsContent.querySelectorAll('h3')[1];
    myPetsContent.insertBefore(releaseControls, petListHeading.nextSibling);
    
    // 绑定按钮事件
    if (!gameState.releaseMode) {
        document.getElementById('btn-release-mode').addEventListener('click', toggleReleaseMode);
    } else {
        document.getElementById('btn-release-selected').addEventListener('click', releaseSelectedPets);
        document.getElementById('btn-cancel-release').addEventListener('click', toggleReleaseMode);
    }
}

// 更新出战魔宠显示
function updateActivePet() {
    if (gameState.activePet !== null && gameState.pets[gameState.activePet]) {
        const pet = gameState.pets[gameState.activePet];
        const petType = petTypeData[pet.type];
        const petRarity = petRarityData[pet.rarity];
        const activeSkill = petActiveSkillData[pet.activeSkill.id];
        
        let passiveSkillsHtml = '';
        pet.passiveSkills.forEach(skill => {
            const skillInfo = petPassiveSkillData[skill.id];
            passiveSkillsHtml += `
                <div class="pet-skill">
                    ${skillInfo.name}: ${skillInfo.description.replace('{value}', skill.value)}
                </div>
            `;
        });
        
        elements.activePet.innerHTML = `
            <div class="pet-item active">
                <div class="pet-name">${pet.name} Lv.${pet.level}</div>
                <div class="pet-type" style="background-color: ${petType.color}">
                    ${petType.icon} ${petType.name}
                </div>
                <div class="pet-rarity" style="color: ${petRarity.color}">
                    ${petRarity.name}
                </div>
                <div class="pet-stats">
                    攻击: ${pet.stats.atk} | 生命: ${pet.stats.hp} | 防御: ${pet.stats.def}
                </div>
                <div class="pet-exp">
                    经验: ${pet.exp}/${getPetExpForLevel(pet.level)}
                </div>
                <div class="pet-skills">
                    <div class="pet-skill">
                        主动技能: ${activeSkill.name} - ${activeSkill.description.replace('{value}', Math.floor(activeSkill.damageMultiplier * 100))}
                    </div>
                    ${passiveSkillsHtml}
                </div>
                <div class="pet-action-buttons">
                    <button class="pet-action-button deactivate" data-index="${gameState.activePet}">取消出战</button>
                </div>
            </div>
        `;
        
        // 绑定取消出战按钮事件
        elements.activePet.querySelector('.deactivate').addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            deactivatePet(index);
            e.stopPropagation();
        });
    } else {
        elements.activePet.innerHTML = `<div class="no-pet">未选择出战魔宠</div>`;
    }
}

// 更新魔宠列表
function updatePetList() {
    elements.petList.innerHTML = "";
    
    if (gameState.pets.length === 0) {
        elements.petList.innerHTML = `<div class="no-pet">暂无魔宠</div>`;
        return;
    }
    
    gameState.pets.forEach((pet, index) => {
        const petType = petTypeData[pet.type];
        const petRarity = petRarityData[pet.rarity];
        const activeSkill = petActiveSkillData[pet.activeSkill.id];
        
        let passiveSkillsHtml = '';
        pet.passiveSkills.forEach(skill => {
            const skillInfo = petPassiveSkillData[skill.id];
            passiveSkillsHtml += `
                <div class="pet-skill">
                    ${skillInfo.name}: ${skillInfo.description.replace('{value}', skill.value)}
                </div>
            `;
        });
        
        const petElement = document.createElement('div');
        petElement.className = `pet-item ${pet.isActive ? 'active' : ''} ${gameState.releaseMode ? 'release-mode' : ''}`;
        if (gameState.releaseMode && pet.selected) {
            petElement.classList.add('selected');
        }
        
        // 在放生模式下添加勾选框
        const checkboxHtml = gameState.releaseMode ? `<div class="pet-checkbox"></div>` : '';
        
        petElement.innerHTML = `
            ${checkboxHtml}
            <div class="pet-name">${pet.name} Lv.${pet.level}</div>
            <div class="pet-type" style="background-color: ${petType.color}">
                ${petType.icon} ${petType.name}
            </div>
            <div class="pet-rarity" style="color: ${petRarity.color}">
                ${petRarity.name}
            </div>
            <div class="pet-stats">
                攻击: ${pet.stats.atk} | 生命: ${pet.stats.hp} | 防御: ${pet.stats.def}
            </div>
            <div class="pet-exp">
                经验: ${pet.exp}/${getPetExpForLevel(pet.level)}
            </div>
            <div class="pet-skills">
                <div class="pet-skill">
                    主动技能: ${activeSkill.name} - ${activeSkill.description.replace('{value}', Math.floor(activeSkill.damageMultiplier * 100))}
                </div>
                ${passiveSkillsHtml}
            </div>
            <div class="pet-action-buttons">
                ${!gameState.releaseMode ? 
                    (pet.isActive ? 
                        `<button class="pet-action-button deactivate" data-index="${index}">取消出战</button>` : 
                        `<button class="pet-action-button activate" data-index="${index}">出战</button>`
                    ) : ''
                }
            </div>
        `;
        
        elements.petList.appendChild(petElement);
        
        // 在放生模式下，点击魔宠会选中/取消选中
        if (gameState.releaseMode) {
            petElement.addEventListener('click', () => {
                pet.selected = !pet.selected;
                updatePetList(); // 刷新显示
            });
        }
    });
    
    // 只在非放生模式下绑定出战/取消出战按钮事件
    if (!gameState.releaseMode) {
        // 绑定出战/取消出战按钮事件
        elements.petList.querySelectorAll('.activate').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                activatePet(index);
                e.stopPropagation();
            });
        });
        
        elements.petList.querySelectorAll('.deactivate').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                deactivatePet(index);
                e.stopPropagation();
            });
        });
    }
}

// 更新魔宠蛋列表
function updatePetEggList() {
    elements.petEggList.innerHTML = "";
    
    if (gameState.petEggs.length === 0) {
        elements.petEggList.innerHTML = `<div class="no-pet">暂无魔宠蛋</div>`;
        return;
    }
    
    gameState.petEggs.forEach((egg, index) => {
        const eggInfo = petEggData[egg.rarity];
        
        const eggElement = document.createElement('div');
        eggElement.className = 'pet-egg-item';
        eggElement.innerHTML = `
            <div class="pet-egg-name" style="color: ${rarityData[egg.rarity].color}">
                ${eggInfo.name}
            </div>
            <button class="pet-egg-hatch" data-index="${index}">孵化</button>
        `;
        
        elements.petEggList.appendChild(eggElement);
    });
    
    // 绑定孵化按钮事件
    elements.petEggList.querySelectorAll('.pet-egg-hatch').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            hatchEgg(index);
            e.stopPropagation();
        });
    });
}

// 激活魔宠（出战）
function activatePet(index) {
    // 先取消当前出战的魔宠
    if (gameState.activePet !== null) {
        gameState.pets[gameState.activePet].isActive = false;
    }
    
    // 设置新的出战魔宠
    gameState.pets[index].isActive = true;
    gameState.activePet = index;
    
    // 更新魔宠面板
    updatePetsPanel();
    
    // 更新玩家属性（应用魔宠加成）
    updatePlayerStats();
    
    logMessage(`${gameState.pets[index].name} 已出战！`);
}

// 取消魔宠出战
function deactivatePet(index) {
    gameState.pets[index].isActive = false;
    
    if (gameState.activePet === index) {
        gameState.activePet = null;
    }
    
    // 更新魔宠面板
    updatePetsPanel();
    
    // 更新玩家属性（移除魔宠加成）
    updatePlayerStats();
    
    logMessage(`${gameState.pets[index].name} 已取消出战！`);
}

// 孵化魔宠蛋
function hatchEgg(index) {
    const egg = gameState.petEggs[index];
    const pet = hatchPetEgg(egg.rarity, gameState.player.level);
    
    // 添加到魔宠列表
    gameState.pets.push(pet);
    
    // 移除魔宠蛋
    gameState.petEggs.splice(index, 1);
    
    // 更新魔宠面板
    updatePetsPanel();
    
    logMessage(`孵化成功！获得了 ${pet.name}！`);
}

// 切换放生模式
function toggleReleaseMode() {
    gameState.releaseMode = !gameState.releaseMode;
    
    // 重置所有魔宠的选中状态
    if (gameState.releaseMode) {
        gameState.pets.forEach(pet => {
            pet.selected = false;
        });
    }
    
    // 更新魔宠面板
    updatePetsPanel();
}

// 放生选中的魔宠
function releaseSelectedPets() {
    // 检查是否有选中的魔宠
    const selectedPets = gameState.pets.filter(pet => pet.selected);
    
    if (selectedPets.length === 0) {
        alert('请先选择要放生的魔宠');
        return;
    }
    
    // 确认放生
    if (confirm(`确定要放生选中的 ${selectedPets.length} 只魔宠吗？此操作不可撤销！`)) {
        // 记录放生的魔宠名称
        const releasedNames = selectedPets.map(pet => pet.name).join('、');
        
        // 移除选中的魔宠
        gameState.pets = gameState.pets.filter(pet => !pet.selected);
        
        // 如果放生了当前出战的魔宠，重置出战状态
        if (gameState.activePet !== null && gameState.pets[gameState.activePet] === undefined) {
            gameState.activePet = null;
        }
        
        // 更新玩家属性（移除魔宠加成）
        updatePlayerStats();
        
        // 记录日志
        logMessage(`已放生魔宠：${releasedNames}`);
        
        // 退出放生模式
        gameState.releaseMode = false;
        
        // 更新魔宠面板
        updatePetsPanel();
    }
}

// 初始化技能面板
function initSkillsPanel() {
    // 更新技能点显示
    elements.skillPoints.textContent = gameState.skills.skillPoints;
    
    // 更新激活技能显示
    updateActiveSkillDisplay();
    
    // 初始化技能树
    updateSkillPanel();
    // initSkillTree('melee', elements.meleeSkillTree);
    // initSkillTree('ranged', elements.rangedSkillTree);
    // initSkillTree('magic', elements.magicSkillTree);
    
    // 绑定技能标签切换事件
    elements.skillTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签和内容的活动状态
            elements.skillTabs.forEach(t => t.classList.remove('active'));
            elements.skillTabContents.forEach(c => c.classList.remove('active'));
            
            // 添加当前标签和对应内容的活动状态
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
}

// 初始化技能树
function initSkillTree(type, container) {
    container.innerHTML = '';
    
    // 获取对应类型的技能树
    const tree = skillTrees[type];
    
    // 创建技能树层级
    tree.forEach((level, levelIndex) => {
        const levelContainer = document.createElement('div');
        levelContainer.className = 'skill-level';
        
        // 创建每个技能节点
        level.forEach(skillId => {
            const skill = typelessskillData[skillId];
            const skillNode = document.createElement('div');
            skillNode.className = 'skill-node';
            skillNode.dataset.skillId = skillId;
            
            // 检查技能是否已学习
            const isLearned = gameState.skills.learned[skillId];
            const isActive = gameState.skills.activeSkill === skillId;
            
            // 设置节点样式
            if (isLearned) {
                skillNode.classList.add('learned');
                if (isActive) {
                    skillNode.classList.add('active');
                }
            } else if (canLearnSkill(skillId, gameState.skills)) {
                skillNode.classList.add('can-learn');
            } else {
                skillNode.classList.add('locked');
            }
            
            // 设置节点内容
            skillNode.innerHTML = `
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-name">${skill.name}</div>
                ${isLearned ? `<div class="skill-level-indicator">${gameState.skills.learned[skillId]}</div>` : ''}
            `;
            
            // 绑定点击事件
            skillNode.addEventListener('click', () => {
                showSkillDetails(skillId);
            });
            
            levelContainer.appendChild(skillNode);
        });
        
        container.appendChild(levelContainer);
    });
}

// 获取技能要求描述
function getSkillRequirements(skillId, skillType) {
    const skill = skillData[skillType][skillId];
    const tier = "tier"+skill.tier;

    let requirements = '<div class="skill-requirements">学习要求:</div>';
    
    if (skill.requiredSkill) {
        const requiredSkill = typelessskillData[skill.requiredSkill];
        requirements += `<div class="skill-requirement">• ${requiredSkill.name} 达到 ${skillUnlockRequirements[tier]} 级</div>`;
    } else {
        requirements += `<div class="skill-requirement">• 无前置技能要求</div>`;
    }
    
    requirements += `<div class="skill-requirement">• 消耗 1 点技能点</div>`;
    
    return requirements;
}

// 获取技能操作按钮
function getSkillActionButtons(skillId,skillType) {
    const isLearned = gameState.skills.learned[skillId];
    const isActive = gameState.skills.activeSkill === skillId;
    const skill = skillData[skillType][skillId];
    
    let buttons = '';
    
    if (!isLearned) {
        // 未学习，显示学习按钮
        const canLearn = canLearnSkill(skillId, skillType, gameState.skills.learned) && gameState.skills.skillPoints >= 1;
        buttons += `<button class="skill-action-button ${canLearn ? '' : 'disabled'}" data-action="learn" ${canLearn ? '' : 'disabled'}>学习 (消耗1点技能点)</button>`;
    } else {
        // 已学习，显示升级按钮
        const canUpgrade = canUpgradeSkill(skillId, gameState.skills);
        const currentLevel = gameState.skills.learned[skillId];
        const upgradeCost = skillUpgradeCost[currentLevel];
        
        if (currentLevel !== "1") { // 不是最高级
            buttons += `<button class="skill-action-button ${canUpgrade ? '' : 'disabled'}" data-action="upgrade" ${canUpgrade ? '' : 'disabled'}>升级 (消耗${upgradeCost}点技能点)</button>`;
        }
        
        // 主动技能可以激活/取消激活
        if (skill.category === 'active') {
            if (isActive) {
                buttons += `<button class="skill-action-button" data-action="deactivate">取消激活</button>`;
            } else {
                buttons += `<button class="skill-action-button" data-action="activate">激活</button>`;
            }
        }
    }
    
    return buttons;
}

// 更新激活技能显示
function updateActiveSkillDisplay() {
    const activeSkillId = gameState.skills.activeSkill;
    
    if (activeSkillId) {
        const skill = typelessskillData[activeSkillId];
        const skillLevel = gameState.skills.learned[activeSkillId];
        
        elements.activeSkill.innerHTML = `
            <div class="active-skill-header">
                <div class="active-skill-icon">${skill.icon}</div>
                <div class="active-skill-info">
                    <div class="active-skill-name">${skill.name}</div>
                    <div class="active-skill-level">等级: ${skillLevel}</div>
                </div>
            </div>
            <div class="active-skill-description">${getSkillDescription(activeSkillId,skill.skillType, skillLevel)}</div>
            <div class="active-skill-cooldown">冷却时间: ${skill.cooldown} 回合</div>
        `;
    } else {
        elements.activeSkill.innerHTML = `<div class="no-active-skill">未激活技能</div>`;
    }
}

// 初始化关卡选择面板
function initStagesPanel() {
    elements.stageList.innerHTML = "";
    
    stageData.forEach(stage => {
        const stageElement = document.createElement('div');
        stageElement.className = `stage-item ${stage.id === gameState.currentStage ? 'active' : ''}`;
        stageElement.innerHTML = `
            <h3>${stage.name}</h3>
            <p>推荐等级: ${stage.recommendedLevel}</p>
            <p>区域: ${stage.area}</p>
        `;
        
        stageElement.addEventListener('click', () => {
            selectStage(stage.id);
        });
        
        elements.stageList.appendChild(stageElement);
    });
}

// 选择关卡
function selectStage(stageId) {
    gameState.currentStage = stageId;
    gameState.battleState.inBattle = false;
    gameState.battleState.currentEnemy = null;
    gameState.battleState.battleProgress = 0;
    gameState.player.stats.hp = gameState.player.stats.maxHp;
    gameState.player.stats.mp = gameState.player.stats.maxMp;

    
    // 更新UI
    initStagesPanel();
    updateUI();
    
    // 关闭面板
    elements.stagesPanel.style.display = 'none';
    
    logMessage(`选择了关卡: ${stageData.find(stage => stage.id === stageId).name}`);

    // 开始新的战斗
    startBattle();
    
    
}

// 绑定按钮事件
function bindEvents() {
    // 装备按钮
    document.getElementById('btn-equipment').addEventListener('click', () => {
        updateInventory();
        elements.equipmentPanel.style.display = 'block';
    });

    // 魔宠按钮
    document.getElementById('btn-pets').addEventListener('click', () => {
        updatePetsPanel();
        elements.petsPanel.style.display = 'block';
    });

    // 魔宠面板标签切换
    elements.petTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签的active类
            elements.petTabs.forEach(t => t.classList.remove('active'));
            elements.petTabContents.forEach(c => c.classList.remove('active'));
            
            // 添加当前标签的active类
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });

    // 技能按钮
    document.getElementById('btn-skills').addEventListener('click', () => {
        elements.skillsPanel.style.display = 'block';
    });
    
    // 关闭面板按钮
    document.querySelectorAll('.close-panel').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.panel').style.display = 'none';
        });
    });
    
    // 关卡选择按钮
    document.getElementById('btn-stages').addEventListener('click', () => {
        elements.stagesPanel.style.display = 'block';
    });
    
    // 关闭面板按钮
    document.querySelectorAll('.close-panel').forEach(button => {
        button.addEventListener('click', (e) => {
            e.target.closest('.panel').style.display = 'none';
        });
    });

    // 重启按钮
    document.getElementById('btn-restart-game').addEventListener('click', () => {
        if (confirm('确定要重启游戏吗？')) {
            localStorage.removeItem('eternalTower_save');
            location.reload();
        };
    });
    
    // 属性面板折叠/展开
    elements.statsToggle.addEventListener('click', () => {
        elements.statsPanel.classList.toggle('collapsed');
    });
    
    // 筛选和排序事件
    elements.filterSlot.addEventListener('change', () => {
        gameState.inventory.filters.slot = elements.filterSlot.value;
        updateInventory();
    });
    
    elements.filterRarity.addEventListener('change', () => {
        gameState.inventory.filters.rarity = elements.filterRarity.value;
        updateInventory();
    });
    
    elements.filterAffix.addEventListener('change', () => {
        gameState.inventory.filters.affix = elements.filterAffix.value;
        updateInventory();
    });
    
    elements.sortBy.addEventListener('change', () => {
        gameState.inventory.sort = elements.sortBy.value;
        updateInventory();
    });
    
    // 丢弃模式
    elements.btnDiscardMode.addEventListener('click', () => {
        gameState.inventory.discardMode = true;
        elements.discardModeControls.style.display = 'flex';
        // 重置所有物品的选中状态
        gameState.inventory.equipment.forEach(item => {
            item.selected = false;
        });
        updateInventory();
    });
    
    elements.btnCancelDiscard.addEventListener('click', () => {
        gameState.inventory.discardMode = false;
        elements.discardModeControls.style.display = 'none';
        updateInventory();
    });
    
    elements.btnSelectAll.addEventListener('click', () => {
        // 选中当前筛选可见的所有物品
        const visibleItems = gameState.inventory.equipment.filter(item => {
            // 复制筛选逻辑
            if (gameState.inventory.filters.slot !== 'all' && item.type !== gameState.inventory.filters.slot) {
                return false;
            }
            
            if (gameState.inventory.filters.rarity !== 'all' && item.rarity !== gameState.inventory.filters.rarity) {
                return false;
            }
            
            if (gameState.inventory.filters.affix !== 'all') {
                if (!item.affixes || !item.affixes.some(affix => affix.id === gameState.inventory.filters.affix)) {
                    return false;
                }
            }
            
            return true;
        });
        
        visibleItems.forEach(item => {
            item.selected = true;
        });
        
        updateInventory();
    });
    
    elements.btnDiscardSelected.addEventListener('click', () => {
        const selectedItems = gameState.inventory.equipment.filter(item => item.selected);
        
        if (selectedItems.length === 0) {
            logMessage("没有选中任何物品");
            return;
        }
        
        if (confirm(`确定要丢弃 ${selectedItems.length} 件物品吗？`)) {
            // 从后往前删除，避免索引变化问题
            for (let i = gameState.inventory.equipment.length - 1; i >= 0; i--) {
                if (gameState.inventory.equipment[i].selected) {
                    gameState.inventory.equipment.splice(i, 1);
                }
            }
            
            logMessage(`已丢弃 ${selectedItems.length} 件物品`);
            
            // 退出丢弃模式
            gameState.inventory.discardMode = false;
            elements.discardModeControls.style.display = 'none';
            updateInventory();
        }
    });
}

// 开始游戏循环
function startGameLoop() {
    setInterval(() => {
        // 更新挂机时间
        gameState.idleTime += 1;
        
        // 自动保存
        if (gameState.idleTime % 60 === 0) {
            saveGame();
        }
        
        // 更新UI
        updateUI();
    }, 1000);
}

// 开始战斗
function startBattle() {
    if (gameState.battleState.inBattle) return;
    
    gameState.battleState.inBattle = true;
    gameState.battleState.battleProgress = 0;
    
    // 生成敌人
    spawnEnemy();
    
    // 开始战斗循环
    battleLoop();
}

// 生成敌人
function spawnEnemy() {
    const currentStage = stageData.find(stage => stage.id === gameState.currentStage);
    const monsterPool = currentStage.monsters;
    
    // 随机选择一个怪物
    const monster = monsterPool[Math.floor(Math.random() * monsterPool.length)];
    
    // 创建敌人实例
    gameState.battleState.currentEnemy = {
        name: monster.name,
        hp: monster.hp,
        maxHp: monster.hp,
        atk: monster.atk,
        def: monster.def,
        exp: monster.exp,
        gold: monster.gold
    };
    
    // 更新UI
    elements.monsterType.textContent = monster.name;
    updateUI();
    
    logMessage(`遭遇了 ${monster.name}`);
}


// 计算伤害
function calculateDamage(attacker, defender) {
    // 基础伤害
    let baseDamage;
    
    // 检查是否为玩家对象（玩家的属性在stats对象中）
    const attackerAtk = attacker.stats ? attacker.stats.atk : attacker.atk;
    const defenderDef = defender.stats ? defender.stats.def : defender.def;
    
    baseDamage = attackerAtk * attackerAtk / (attackerAtk + defenderDef);
    
    // 确保最小伤害为1
    baseDamage = Math.max(baseDamage, 1);
    
    // 暴击判定 (仅玩家可以暴击)
    if (attacker === gameState.player && Math.random() * 100 < attacker.stats.critRate) {
        baseDamage *= attacker.stats.critDamage;
    }
    
    return Math.floor(baseDamage);
}

// 处理敌人死亡
function handleEnemyDefeat() {
    const enemy = gameState.battleState.currentEnemy;
    
    logMessage(`击败了 ${enemy.name}`);
    
    // 获得经验
    const expGained = enemy.exp;
    gameState.player.exp += expGained;
    logMessage(`获得 ${expGained} 点经验`);
    
    // 检查升级
    checkLevelUp();
    
    // 获得金币
    const goldGained = Math.floor(Math.random() * (enemy.gold.max - enemy.gold.min + 1)) + enemy.gold.min;
    gameState.inventory.gold += goldGained;
    logMessage(`获得 ${goldGained} 金币`);
    
    // 掉落装备
    dropEquipment();
    
    // 增加击杀计数
    gameState.battleState.killCount++;
    
    // 生成新敌人并在延迟后继续战斗
    setTimeout(() => {
        gameState.battleState.inBattle = false;
        gameState.battleState.battleProgress = 0; // 重置战斗进度条
        gameState.player.hp = gameState.player.stats.maxHp; // 恢复玩家HP
        updateUI(); // 更新UI显示新敌人
        startBattle(); // 开始新的战斗
    }, 2000); // 延迟2秒后生成新敌人并继续战斗
}

function handlePlayerDefeat() {
    // 玩家死亡处理
    logMessage("玩家战败，正在恢复...");
    gameState.battleState.inBattle = false;
    gameState.battleState.currentEnemy = null;
    updateUI();
    
    // 等待10秒
    setTimeout(() => {
        // 恢复满HP
        gameState.player.stats.hp = gameState.player.stats.maxHp;
        
        // 更新UI
        updateUI();
        
        // 继续战斗
        logMessage("恢复完成，继续战斗！");
        startBattle();
    }, 10000); // 10秒延迟
}

// 战斗循环
function battleLoop() {
    if (!gameState.battleState.inBattle || !gameState.battleState.currentEnemy) return;
    
    // 处理技能效果
    let battleLog = [];

    // 检查是否被眩晕
    if (gameState.battleState.stunDuration > 0) {
        battleLog.push(`${gameState.battleState.currentEnemy.name} 被眩晕，无法行动！`);
        gameState.battleState.stunDuration -= 1;
    }
    
    // 处理持续伤害
    if (gameState.battleState.dotDuration > 0) {
        const dotDamage = gameState.battleState.dotDamage;
        gameState.battleState.currentEnemy.hp -= dotDamage;
        battleLog.push(`${gameState.battleState.currentEnemy.name} 受到 ${dotDamage} 点持续伤害！`);
        gameState.battleState.dotDuration -= 1;
    }
    
    // 处理攻击力提升
    let atkMultiplier = 1.0;
    if (gameState.battleState.atkBoostDuration > 0) {
        atkMultiplier += gameState.battleState.atkBoost / 100;
        gameState.battleState.atkBoostDuration -= 1;
    }
    
    // 处理伤害减免
    let damageReduction = 0;
    if (gameState.battleState.damageReductionDuration > 0) {
        damageReduction = gameState.battleState.damageReduction;
        gameState.battleState.damageReductionDuration -= 1;
    }
    
    // 处理护盾
    if (gameState.battleState.shieldDuration > 0) {
        gameState.battleState.shieldDuration -= 1;
    } else {
        gameState.battleState.shield = 0; // 护盾过期
    }
    
    // 玩家攻击
    let playerDamage = calculateDamage(gameState.player, gameState.battleState.currentEnemy);
    playerDamage = Math.floor(playerDamage * atkMultiplier); // 应用攻击力提升
    
    // 检查是否触发重击（被动技能）
    if (gameState.skills.learned["heavyStrike"]) {
        const heavyStrikeLevel = gameState.skills.learned["heavyStrike"];
        const effect = calculateSkillEffect("heavyStrike", "melee",heavyStrikeLevel);
        
        if (Math.random() * 100 < effect.chance) {
            playerDamage = Math.floor(playerDamage * (effect.damage / 100));
            battleLog.push(`触发【重击】！造成 ${effect.damage}% 伤害！`);
        }
    }
    
    // 应用主动技能
    const activeSkillId = gameState.skills.activeSkill;
    const skillType = typelessskillData[activeSkillId].skillType;
    if (activeSkillId && typelessskillData[activeSkillId].type === 'active') {
        // 检查技能冷却
        if (gameState.skills.cooldowns[activeSkillId] === 0) {
            const skillLevel = gameState.skills.learned[activeSkillId];
            const result = calculateSkillEffect(activeSkillId, skillType, skillLevel);
            
            // 记录技能效果
            battleLog.push(`使用技能【${typelessskillData[activeSkillId].name}】！`);
            
            if (result.damage) {
                if (result.hits) {
                    battleLog.push(`造成 ${result.hits} 次攻击，总计 ${result.damage} 点伤害！`);
                } else {
                    battleLog.push(`造成 ${result.damage} 点伤害！`);
                }
                playerDamage = 0; // 技能替代普通攻击
            }
            
            if (result.stun) {
                battleLog.push(`眩晕敌人 ${result.stun} 回合！`);
            }
            
            if (result.atkBoost) {
                battleLog.push(`提升攻击力 ${result.atkBoost}%，持续 ${result.duration} 回合！`);
            }
            
            if (result.damageReduction) {
                battleLog.push(`减少受到的伤害 ${result.damageReduction}%，持续 ${result.duration} 回合！`);
            }
            
            if (result.dot) {
                battleLog.push(`施加持续伤害效果，每回合 ${result.dot} 点，持续 ${result.duration} 回合！`);
            }
            
            if (result.slow) {
                battleLog.push(`减速敌人 ${result.slow}%！`);
            }
            
            if (result.shield) {
                battleLog.push(`创造护盾，可吸收 ${result.shield} 点伤害，持续 ${result.duration} 回合！`);
            }
            
            // 设置技能冷却
            gameState.skills.cooldowns[activeSkillId] = typelessskillData[activeSkillId].cooldown;
        } else {
            gameState.skills.cooldowns[activeSkillId] -= 1;
            battleLog.push(`技能【${typelessskillData[activeSkillId].name}】冷却中，还需 ${gameState.skills.cooldowns[activeSkillId]} 回合！`);
        }
    }
    
    // 应用普通攻击伤害
    if (playerDamage > 0) {
        gameState.battleState.currentEnemy.hp -= playerDamage;
        
        // 判断是否暴击
        const isCritical = Math.random() * 100 < gameState.player.stats.critRate;
        battleLog.push(`你对 ${gameState.battleState.currentEnemy.name} 造成 ${playerDamage} 点${isCritical ? '暴击' : ''}伤害`);
    }

    // 魔宠技能攻击
    if (gameState.activePet !== null && gameState.pets[gameState.activePet]) {
        const pet = gameState.pets[gameState.activePet];
        const skill = pet.activeSkill;
        
        // 检查技能冷却
        if (skill.cooldown <= 0) {
            const skillInfo = petActiveSkillData[skill.id];
            const skillDamage = calculatePetSkillDamage(pet, skill, gameState.player.stats);
            
            gameState.battleState.currentEnemy.hp -= skillDamage;
            
            battleLog.push(`${pet.name} 使用 ${skillInfo.name} 对 ${gameState.battleState.currentEnemy.name} 造成 ${skillDamage} 点伤害`);
            
            // 设置技能冷却
            skill.cooldown = skillInfo.cooldown;
        } else {
            // 减少冷却时间
            skill.cooldown--;
        }
    }

    // 检查敌人是否死亡
    if (gameState.battleState.currentEnemy.hp <= 0) {
        battleLog.forEach(message => logMessage(message));
        handleEnemyDefeat();
        return;
    }
    
    // 敌人攻击（如果没有被眩晕）
    if (gameState.battleState.stunDuration <= 0) {
        let enemyDamage = calculateDamage(gameState.battleState.currentEnemy, gameState.player);
        
        // 应用伤害减免
        if (damageReduction > 0) {
            enemyDamage = Math.floor(enemyDamage * (1 - damageReduction / 100));
        }
        
        // 应用护盾
        if (gameState.battleState.shield > 0) {
            if (enemyDamage <= gameState.battleState.shield) {
                gameState.battleState.shield -= enemyDamage;
                battleLog.push(`护盾吸收了 ${enemyDamage} 点伤害！剩余护盾值: ${gameState.battleState.shield}`);
                enemyDamage = 0;
            } else {
                enemyDamage -= gameState.battleState.shield;
                battleLog.push(`护盾吸收了 ${gameState.battleState.shield} 点伤害并被击破！`);
                gameState.battleState.shield = 0;
                gameState.player.stats.hp -= enemyDamage;
                battleLog.push(`${gameState.battleState.currentEnemy.name} 对你造成 ${enemyDamage} 点伤害`);
            }
        } else {
            gameState.player.stats.hp -= enemyDamage;
            battleLog.push(`${gameState.battleState.currentEnemy.name} 对你造成 ${enemyDamage} 点伤害`);
        }
    }
    
    // 减少技能冷却时间
    for (const skillId in gameState.skills.cooldowns) {
        if (gameState.skills.cooldowns[skillId] > 0) {
            gameState.skills.cooldowns[skillId]--;
        }
    }
    
    // 检查玩家是否死亡
    if (gameState.player.stats.hp <= 0) {
        battleLog.forEach(message => logMessage(message));
        handlePlayerDefeat();
        return;
    }
    
    // 更新战斗进度
    gameState.battleState.battleProgress = 100 - Math.floor((gameState.battleState.currentEnemy.hp / gameState.battleState.currentEnemy.maxHp) * 100);
    
    // 更新UI
    updateUI();

    // 记录战斗日志
    console.log(battleLog)
    // logMessage('打印战斗日志')
    battleLog.forEach(message => logMessage(message));
    // logMessage('日志结束')
    
    // 继续战斗
    setTimeout(battleLoop, 2000);
}

// 检查升级
function checkLevelUp() {
    const expNeeded = getExpForLevel(gameState.player.level);
    
    if (gameState.player.exp >= expNeeded) {
        // 升级
        gameState.player.level++;
        gameState.player.exp -= expNeeded;
        
        // 获得技能点
        gameState.skills.skillPoints += 1;
        
        // 更新属性
        updatePlayerStats();
        
        // 恢复满血
        gameState.player.stats.hp = gameState.player.stats.maxHp;
        
        logMessage(`恭喜！你升级到了 ${gameState.player.level} 级，获得了1点技能点！`);
        
        // 继续检查是否可以再次升级
        checkLevelUp();
    }
}

// 掉落装备
function dropEquipment() {
    const currentStage = stageData.find(stage => stage.id === gameState.currentStage);
    const dropTable = currentStage.dropTable.equipment;
    
    // 获取魔宠提供的掉落加成
    let dropRateBonus = 0;
    if (gameState.activePet !== null && gameState.pets[gameState.activePet]) {
        const petBonusStats = getPetBonusStats(gameState.pets[gameState.activePet]);
        dropRateBonus = petBonusStats.dropRate || 0;
    }
    
    // 随机决定是否掉落装备，考虑魔宠加成
    let dropRoll = Math.random();
    let droppedItem = null;
    
    for (const drop of dropTable) {
        // 应用魔宠掉落加成
        const adjustedChance = drop.chance * (1 + dropRateBonus);
        
        if (dropRoll < adjustedChance) {
            // 生成装备
            droppedItem = generateEquipment(drop.rarity, gameState.player.level);
            break;
        }
        dropRoll -= adjustedChance;
    }
    
    if (droppedItem) {
        // 添加到背包
        gameState.inventory.equipment.push(droppedItem);
        
        logMessage(`掉落了 [${rarityData[droppedItem.rarity].name}]${equipmentTypes[droppedItem.type].name}`);
    }
    
    // 检查是否掉落魔宠蛋
    if (currentStage.dropTable.petEgg) {
        const petEggChance = currentStage.dropTable.petEgg.chance * (1 + dropRateBonus);
        
        if (Math.random() < petEggChance) {
            // 决定魔宠蛋品质
            let eggRarity;
            const rarityRoll = Math.random();
            
            if (rarityRoll < 0.6) eggRarity = "common";
            else if (rarityRoll < 0.85) eggRarity = "uncommon";
            else if (rarityRoll < 0.95) eggRarity = "rare";
            else if (rarityRoll < 0.99) eggRarity = "epic";
            else eggRarity = "legendary";
            
            // 添加魔宠蛋到列表
            gameState.petEggs.push({ rarity: eggRarity });
            
            logMessage(`掉落了 ${petEggData[eggRarity].name}!`);
        }
    }
}

// 生成装备
function generateEquipment(rarity, playerLevel) {
    // 选择装备类型
    const equipmentTypeKeys = Object.keys(equipmentTypes);
    const type = equipmentTypeKeys[Math.floor(Math.random() * equipmentTypeKeys.length)];
    
    // 获取装备强度系数
    const scalingFactor = getEquipmentScalingFactor(playerLevel);
    
    // 基础属性值
    const baseValue = Math.floor(5 * scalingFactor);
    
    // 根据稀有度调整属性
    const rarityInfo = rarityData[rarity];
    const statMultiplier = Math.random() * (rarityInfo.maxStats - rarityInfo.minStats) + rarityInfo.minStats;
    
    // 生成基础属性
    const stats = {};
    
    // 所有装备都有一个主属性
    if (type === 'weapon') {
        stats.atk = Math.floor(baseValue * statMultiplier * equipmentTypes[type].statMultiplier);
    } else {
        stats.def = Math.floor(baseValue * statMultiplier * equipmentTypes[type].statMultiplier);
        
        // 50%概率添加生命值
        if (Math.random() < 0.5) {
            stats.hp = Math.floor(baseValue * 3 * statMultiplier * equipmentTypes[type].statMultiplier);
        }
    }
    
    // 生成词条
    const affixes = [];
    const affixCount = Math.floor(Math.random() * (rarityInfo.affixCount[1] - rarityInfo.affixCount[0] + 1)) + rarityInfo.affixCount[0];
    
    if (affixCount > 0) {
        // 可用词条列表
        const availableAffixes = Object.keys(affixData).filter(affixId => {
            const affix = affixData[affixId];
            return !affix.minRarity || rarityData[affix.minRarity].affixCount[0] <= rarityInfo.affixCount[0];
        });
        
        // 随机选择词条
        for (let i = 0; i < affixCount; i++) {
            if (availableAffixes.length === 0) break;
            
            const affixIndex = Math.floor(Math.random() * availableAffixes.length);
            const affixId = availableAffixes[affixIndex];
            const affix = affixData[affixId];
            
            // 生成词条值
            const value = Math.floor(Math.random() * (affix.max - affix.min + 1)) + affix.min;
            
            // 添加词条
            affixes.push({
                id: affixId,
                value: value,
                type: affix.type || "special"
            });
            
            // 移除已选择的词条，避免重复
            availableAffixes.splice(affixIndex, 1);
        }
    }
    
    // 返回生成的装备
    return {
        type: type,
        rarity: rarity,
        level: playerLevel,
        stats: stats,
        affixes: affixes
    };
}

// 初始化游戏
initGame();