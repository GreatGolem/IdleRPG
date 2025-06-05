// 游戏状态
let gameState = {
    player: {
        level: 1,
        exp: 0,
        class: "warrior",
        stats: { hp: 100, maxHp: 100, atk: 10, def: 5, mp: 0, agi: 3, critRate: 5, critDamage: 1.5 },
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
        petEggs: []
    },
    currentStage: "plains_1",
    battleState: {
        inBattle: false,
        currentEnemy: null,
        battleProgress: 0,
        killCount: 0
    },
    idleTime: 0,
    startTime: Date.now()
};

// DOM元素引用
const elements = {
    characterLevel: document.getElementById('character-level'),
    characterClass: document.getElementById('character-class'),
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
    // 添加属性面板元素
    statAtk: document.getElementById('stat-atk'),
    statDef: document.getElementById('stat-def'),
    statHp: document.getElementById('stat-hp'),
    statMp: document.getElementById('stat-mp'),
    statAgi: document.getElementById('stat-agi'),
    statCritRate: document.getElementById('stat-crit-rate'),
    statCritDamage: document.getElementById('stat-crit-damage'),
    statsPanel: document.getElementById('stats-panel'),
    statsToggle: document.getElementById('stats-toggle')
};

// 初始化游戏
function initGame() {
    // 加载存档
    loadGame();
    
    // 更新UI
    updateUI();
    
    // 初始化装备面板
    initEquipmentPanel();
    
    // 初始化关卡选择面板
    initStagesPanel();
    
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
    
    gameState.inventory.equipment.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = `inventory-item ${item.rarity}`;
        itemElement.innerHTML = generateEquipmentHTML(item);
        itemElement.dataset.index = index;
        
        itemElement.addEventListener('click', () => {
            equipItem(index);
        });
        
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
    
    // 计算最终属性
    gameState.player.stats = {
        hp: Math.floor((baseStats.hp + equipStats.hp) * (1 + percentBonuses.hp / 100)),
        maxHp: Math.floor((baseStats.hp + equipStats.hp) * (1 + percentBonuses.hp / 100)),
        atk: Math.floor((baseStats.atk + equipStats.atk) * (1 + percentBonuses.atk / 100)),
        def: Math.floor((baseStats.def + equipStats.def) * (1 + percentBonuses.def / 100)),
        mp: Math.floor((baseStats.mp + equipStats.mp) * (1 + percentBonuses.mp / 100)),
        agi: Math.floor((baseStats.agi + equipStats.agi) * (1 + percentBonuses.agi / 100)),
        critRate: baseStats.critRate + equipStats.critRate,
        critDamage: baseStats.critDamage + equipStats.critDamage
    };
    
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
        updateUI(); // 更新UI显示新敌人
        startBattle(); // 开始新的战斗
    }, 2000); // 延迟1秒后生成新敌人并继续战斗
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
    
    // 玩家攻击
    const playerDamage = calculateDamage(gameState.player, gameState.battleState.currentEnemy);
    gameState.battleState.currentEnemy.hp -= playerDamage;
    
    // 判断是否暴击
    const isCritical = Math.random() * 100 < gameState.player.stats.critRate;
    
    logMessage(`你对 ${gameState.battleState.currentEnemy.name} 造成 ${playerDamage} 点${isCritical ? '暴击' : ''}伤害`);
    
    // 检查敌人是否死亡
    if (gameState.battleState.currentEnemy.hp <= 0) {
        handleEnemyDefeat();
        return;
    }
    
    // 敌人攻击
    const enemyDamage = calculateDamage(gameState.battleState.currentEnemy, gameState.player);
    gameState.player.stats.hp -= enemyDamage;
    
    logMessage(`${gameState.battleState.currentEnemy.name} 对你造成 ${enemyDamage} 点伤害`);
    
    // 检查玩家是否死亡
    if (gameState.player.stats.hp <= 0) {
        handlePlayerDefeat();
        return;
    }
    
    // 更新战斗进度
    gameState.battleState.battleProgress = 100 - Math.floor((gameState.battleState.currentEnemy.hp / gameState.battleState.currentEnemy.maxHp) * 100);
    
    // 更新UI
    updateUI();
    
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
        
        // 更新属性
        updatePlayerStats();
        
        // 恢复满血
        gameState.player.stats.hp = gameState.player.stats.maxHp;
        
        logMessage(`恭喜！你升级到了 ${gameState.player.level} 级`);
        
        // 继续检查是否可以再次升级
        checkLevelUp();
    }
}

// 掉落装备
function dropEquipment() {
    const currentStage = stageData.find(stage => stage.id === gameState.currentStage);
    const dropTable = currentStage.dropTable.equipment;
    
    // 随机决定是否掉落装备
    let dropRoll = Math.random();
    let droppedItem = null;
    
    for (const drop of dropTable) {
        if (dropRoll < drop.chance) {
            // 生成装备
            droppedItem = generateEquipment(drop.rarity, gameState.player.level);
            break;
        }
        dropRoll -= drop.chance;
    }
    
    if (droppedItem) {
        // 添加到背包
        gameState.inventory.equipment.push(droppedItem);
        
        logMessage(`掉落了 [${rarityData[droppedItem.rarity].name}]${equipmentTypes[droppedItem.type].name}`);
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