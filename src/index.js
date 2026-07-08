<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dragon Warrior Quest - By Colette</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; }

        body {
            font-family: 'Trebuchet MS', sans-serif;
            background: radial-gradient(circle at center, #2b2b2b, #111);
            color: #ecf0f1;
            text-align: center;
            margin: 0;
            padding: 10px;
            overflow-x: hidden;
            position: relative;
        }

        /* Centered Language Selector */
        .lang-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 15px 0 5px 0;
            z-index: 100;
            width: 100%;
        }
        .lang-container select {
            background: #222;
            color: #f1c40f;
            border: 2px solid #555;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
        }
        .lang-container select:hover {
            border-color: #f1c40f;
            background: #333;
        }
        
        h1 { color: #f1c40f; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 5px #000; margin-bottom: 5px; font-size: clamp(20px, 5vw, 32px); }
        h3 { margin-top: 0; color: #bdc3c7; font-style: italic; font-size: clamp(14px, 3vw, 18px); margin-bottom: 15px; }
        
        #setup-screen, #game-screen {
            background: linear-gradient(135deg, #3a3f44, #272b30);
            width: 100%; max-width: 700px; margin: 0 auto; padding: 15px;
            border-radius: 12px; border: 2px solid #555; box-shadow: 0 10px 20px rgba(0,0,0,0.8);
        }
        #game-screen { display: none; }
        
        /* Expandable Rules Box */
        details.rules-box {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid #f1c40f;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: left;
            font-size: clamp(12px, 3vw, 15px);
            color: #ecf0f1;
            overflow: hidden;
        }
        details.rules-box summary {
            cursor: pointer;
            font-weight: bold;
            color: #f1c40f;
            text-align: center;
            font-size: 1.2em;
            padding: 12px;
            list-style: none;
            background: rgba(255, 255, 255, 0.05);
            transition: background 0.2s;
        }
        details.rules-box summary::-webkit-details-marker { display: none; }
        details.rules-box summary:hover { background: rgba(255, 255, 255, 0.1); }
        details.rules-box summary::before { content: '▶ '; display: inline-block; transition: transform 0.2s; font-size: 0.8em; }
        details.rules-box[open] summary::before { transform: rotate(90deg); }
        
        .rules-content { padding: 0 15px 15px 15px; }
        .rules-content ul { margin: 0; padding-left: 20px; line-height: 1.6; }
        .rules-content li { margin-bottom: 8px; }

        /* Highlighted Keywords */
        .hl {
            color: #e74c3c;
            font-weight: bold;
            text-shadow: 1px 1px 2px #000;
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 5px;
            border-radius: 4px;
            border-bottom: 1px solid #e74c3c;
        }

        input, select, button { padding: 10px; margin: 5px; border-radius: 6px; border: 1px solid #222; font-size: clamp(14px, 3vw, 16px); font-weight: bold; width: 100%; }
        
        .player-setup-box { background: #222; padding: 10px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #444; }
        .player-row { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 5px; }
        .skill-desc { font-size: clamp(12px, 2.5vw, 14px); color: #f1c40f; font-style: italic; margin-top: 5px; display: block; }
        
        .ai-btn { background: linear-gradient(135deg, #0984e3, #6c5ce7); color: white; border: 1px solid #a29bfe; box-shadow: 0 0 8px rgba(108, 92, 231, 0.5); }
        .ai-btn:hover { background: linear-gradient(135deg, #6c5ce7, #0984e3); box-shadow: 0 0 12px rgba(108, 92, 231, 0.8); }

        button { background: linear-gradient(to bottom, #e74c3c, #c0392b); color: white; cursor: pointer; text-shadow: 1px 1px 2px black; box-shadow: 0 4px 6px rgba(0,0,0,0.5); transition: all 0.2s; padding: 12px 24px; }
        button:hover { transform: translateY(2px); box-shadow: 0 2px 3px rgba(0,0,0,0.5); }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        
        #log { height: 120px; overflow-y: auto; background: #000; color: #2ecc71; padding: 10px; border-radius: 5px; text-align: left; font-family: monospace; font-size: clamp(12px, 2.5vw, 14px); margin: 10px 0 15px 0; border: 1px solid #555; }

        #board { display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px; margin: 15px 0 0 0; padding: 4px; background: #1a1a1a; border: 3px solid #f1c40f; border-radius: 8px; box-shadow: inset 0 0 10px black; width: 100%; }
        .tile { background: linear-gradient(135deg, #7f8c8d, #636e72); aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: clamp(10px, 2.5vw, 14px); font-weight: bold; position: relative; color: #fff; border-radius: 3px; border: 1px solid #444; }
        .dest-label { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); font-size: clamp(7px, 2vw, 11px); background: rgba(0,0,0,0.7); color: #fff; padding: 1px 4px; border-radius: 4px; z-index: 5; white-space: nowrap; }

        .tile.portal { background: linear-gradient(135deg, #2980b9, #27ae60); border-color: #2ecc71; animation: pulse-portal 2s infinite; }
        .tile.portal::after { content: '🌀'; position: absolute; font-size: clamp(14px, 3vw, 24px); opacity: 0.4; z-index: 1; }
        .tile.trap { background: linear-gradient(135deg, #c0392b, #d35400); border-color: #e74c3c; animation: pulse-trap 2s infinite; }
        .tile.trap::after { content: '🔥'; position: absolute; font-size: clamp(14px, 3vw, 24px); opacity: 0.4; z-index: 1; }

        @keyframes pulse-portal { 0% { box-shadow: 0 0 3px #2ecc71; } 50% { box-shadow: 0 0 15px #2ecc71, inset 0 0 8px rgba(255,255,255,0.5); } 100% { box-shadow: 0 0 3px #2ecc71; } }
        @keyframes pulse-trap { 0% { box-shadow: 0 0 3px #e74c3c; } 50% { box-shadow: 0 0 15px #e74c3c, inset 0 0 8px rgba(0,0,0,0.8); } 100% { box-shadow: 0 0 3px #e74c3c; } }
        
        .tile.start { background: #34495e; color: #3498db; }
        .tile.end { background: linear-gradient(45deg, #f1c40f, #e67e22); font-size: clamp(16px, 4vw, 24px); box-shadow: 0 0 10px #f1c40f; }
        
        .player-token { position: absolute; font-size: clamp(14px, 3.5vw, 22px); line-height: 1; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); transition: all 0.4s ease-in-out; z-index: 10; }
        
        .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 10px; background: #111; padding: 10px; border-radius: 8px; }
        @media (max-width: 500px) { .stats { grid-template-columns: 1fr; } }

        .player-stat { padding: 10px; border-radius: 5px; background: #222; font-size: clamp(12px, 2.5vw, 14px); text-align: left; }
        .stat-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em; }
        .stat-ability { color: #bdc3c7; font-size: 0.85em; font-style: italic; margin-top: 4px; display: block; border-top: 1px dashed #444; padding-top: 4px;}
        
        /* Updated Setup Actions Layout */
        .setup-actions { display: flex; flex-direction: column; align-items: center; gap: 5px; margin-top: 15px; }
        .setup-actions-top { display: flex; justify-content: center; gap: 10px; width: 100%; }
    </style>
</head>
<body>

    <div class="lang-container">
        <select id="lang-select" onchange="changeLanguage()">
            <option value="zh">繁體中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="es">Español</option>
        </select>
    </div>

    <h1 data-i18n="title">龍戰士任務 🐉</h1>
    <h3 data-i18n="designer">遊戲設計：Colette</h3>

    <div id="setup-screen">
        
        <details class="rules-box" open>
            <summary data-i18n="rulesTitle">📜 任務規則</summary>
            <div class="rules-content">
                <ul>
                    <li data-i18n="ruleGoal"><strong>目標：</strong>準確到達 <span class='hl'>100號格子</span> 擊敗巨龍！超出則會後退。</li>
                    <li data-i18n="rulePortals"><strong>傳送門與陷阱：</strong><span class='hl'>魔法傳送門 🌀</span> 讓你前進。<span class='hl'>巨龍陷阱 🔥</span> 讓你後退。</li>
                    <li data-i18n="ruleShield"><strong>寶石護盾：</strong>自動消耗 <span class='hl'>💎 寶石</span>（花費取決於職業）摧毀陷阱，保你安全！</li>
                    <li data-i18n="ruleMilestone"><strong>里程碑：</strong>經過 <span class='hl'>25, 50, 75</span> 號格子會獲得裝滿寶石的 <span class='hl'>寶箱</span>。</li>
                    <li data-i18n="ruleClasses"><strong>英雄職業：</strong>每個英雄都有 <span class='hl'>獨特技能</span>。選擇你最喜歡的，或隨機分配！</li>
                </ul>
            </div>
        </details>

        <h2 data-i18n="prepBattle">⚔️ 準備戰鬥 ⚔️</h2>
        <select id="player-count" onchange="updatePlayerInputs()" style="max-width: 150px;">
            <option value="1">1 Player</option>
            <option value="2">2 Players</option>
            <option value="3">3 Players</option>
            <option value="4">4 Players</option>
        </select>
        
        <div id="player-inputs"></div>
        
        <div class="setup-actions">
            <div class="setup-actions-top">
                <button onclick="randomizeHeroes()" style="flex: 1; max-width: 200px;" data-i18n="btnRandom">🎲 隨機分配</button>
                <button onclick="startGame()" style="flex: 1; max-width: 200px;" data-i18n="btnStart">開始任務</button>
            </div>
            <button id="ai-names-btn" onclick="generateAllAINames()" class="ai-btn" style="max-width: 410px; width: 100%;" data-i18n="btnAINames">✨ AI 自動命名所有玩家</button>
        </div>
    </div>

    <div id="game-screen">
        <div class="stats" id="stats-container"></div>
        
        <div class="game-controls">
            <h2 id="turn-indicator" style="font-size: clamp(16px, 4vw, 24px); margin: 0; text-align: left; flex: 1;"></h2>
            <button onclick="resetGame()" style="background: linear-gradient(to bottom, #7f8c8d, #636e72); padding: 8px 12px; font-size: clamp(12px, 3vw, 14px); width: auto;" data-i18n="btnMenu">⬅️ 菜單</button>
        </div>
        
        <button id="roll-btn" onclick="takeTurn()" style="max-width: 250px;" data-i18n="btnRoll">擲骰子 🎲</button>
        <p id="dice-result" style="font-weight: bold; font-size: clamp(14px, 3vw, 18px); color: #f1c40f; margin: 10px 0; min-height: 22px;"></p>
        
        <div id="log"></div>
        <div id="board"></div>
    </div>

    <script>
        // ==========================================
        // ⚠️ AI CONFIGURATION (BATCH GENERATION)
        // ==========================================
        async function generateAllAINames() {
            const count = parseInt(document.getElementById('player-count').value);
            const aiBtn = document.getElementById('ai-names-btn');
            const originalBtnText = aiBtn.innerHTML;
            
            const originalNames = [];
            const classNames = [];
            
            // Lock inputs and gather classes
            for (let i = 1; i <= count; i++) {
                const inputField = document.getElementById(`p${i}-name`);
                const selectedIcon = document.getElementById(`p${i}-icon`).value;
                const heroClass = i18n[currentLang].classes[selectedIcon].name;
                
                originalNames[i] = inputField.value.trim() || heroClass;
                classNames.push(heroClass);
                
                inputField.value = "...";
                inputField.disabled = true;
            }

            aiBtn.innerHTML = "⏳ Summoning...";
            aiBtn.disabled = true;

            try {
                const randomSeed = Math.floor(Math.random() * 1000000);
                
                // Batch Prompt: Ask for all names at once in a comma-separated format
                const prompt = `You are a fantasy name generator. Generate exactly ${count} highly creative, unique first names for these classes respectively: ${classNames.join(', ')}. If the UI request language implies it, format names to match that culture. Reply ONLY with a comma-separated list of the names. No numbers, no bullet points, no extra text. Random Seed: ${randomSeed}`;
                
                const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?nocache=${randomSeed}`);
                
                if (!response.ok) throw new Error("Server Error");
                
                let resultText = await response.text();
                
                // Clean up the string and split it into an array
                let generatedNames = resultText.replace(/["'\n\.]/g, "").split(',').map(n => n.trim());
                
                // Distribute the new names to the inputs
                for (let i = 1; i <= count; i++) {
                    const inputField = document.getElementById(`p${i}-name`);
                    // If the AI somehow failed to give enough names, fallback to the original
                    let finalName = generatedNames[i-1] ? generatedNames[i-1].split(" ")[0] : originalNames[i];
                    inputField.value = finalName;
                    inputField.disabled = false;
                }
                
            } catch (error) {
                console.error("AI Error Details:", error);
                alert(`❌ AI Connection failed. Please check your internet connection.`);
                
                // Revert to original names on failure
                for (let i = 1; i <= count; i++) {
                    const inputField = document.getElementById(`p${i}-name`);
                    inputField.value = originalNames[i];
                    inputField.disabled = false;
                }
            } finally {
                // Restore button state
                aiBtn.innerHTML = originalBtnText;
                aiBtn.disabled = false;
            }
        }
        // ==========================================

        // ==========================================
        // LOCALIZATION (i18n) & DYNAMIC LOGS
        // ==========================================
        const i18n = {
            zh: {
                title: "龍戰士任務 🐉", designer: "遊戲設計：Colette", rulesTitle: "📜 任務規則",
                ruleGoal: "<strong>目標：</strong>準確到達 <span class='hl'>100號格子</span> 擊敗巨龍！超出則會後退。",
                rulePortals: "<strong>傳送門與陷阱：</strong><span class='hl'>魔法傳送門 🌀</span> 讓你前進。<span class='hl'>巨龍陷阱 🔥</span> 讓你後退。",
                ruleShield: "<strong>寶石護盾：</strong>自動消耗 <span class='hl'>💎 寶石</span>（花費取決於職業）摧毀陷阱，保你安全！",
                ruleMilestone: "<strong>里程碑：</strong>經過 <span class='hl'>25, 50, 75</span> 號格子會獲得裝滿寶石的 <span class='hl'>寶箱</span>。",
                ruleClasses: "<strong>英雄職業：</strong>每個英雄都有 <span class='hl'>獨特技能</span>。選擇你最喜歡的，或隨機分配！",
                prepBattle: "⚔️ 準備戰鬥 ⚔️", btnRandom: "🎲 隨機分配", btnStart: "開始任務", btnMenu: "⬅️ 菜單", btnRoll: "擲骰子 🎲",
                btnAINames: "✨ AI 自動命名所有玩家",
                classes: {
                    '🛡️': { name: '騎士', desc: '護盾僅需1顆寶石。里程碑額外獲得+1寶石。' },
                    '🏹': { name: '遊俠', desc: '每次擲骰子點數+1。' },
                    '🧙': { name: '法師', desc: '傳送門獲得3寶石。自動消耗5寶石在前方開啟傳送門。' },
                    '🥷': { name: '忍者', desc: '擲出6可獲得額外回合。' },
                    '🧛': { name: '吸血鬼', desc: '觸發陷阱時與領先者互換位置。若自己領先，則獲得3寶石。' },
                    '🧚': { name: '仙女', desc: '開局3寶石。擲出6時全員獲得1回合護盾，並各向你上貢1寶石。' },
                    '🐺': { name: '狼人', desc: '狼形態免疫1次陷阱。觸發後變回人類，再次觸發陷阱後變回狼。' },
                    '👑': { name: '皇室', desc: '在終點永遠不會被反彈後退。' },
                    '🦉': { name: '學者', desc: '使用後關閉傳送門。加深陷阱，將其目的地推向更低的格子。' }
                },
                logs: {
                    logStart: "系統：任務開始！",
                    logRoll: (t, n, r) => `${t} ${n} 擲出了 ${r}！`,
                    logRangerBonus: " (+1 遊俠速度)",
                    logFairyMagic: "🧚 仙女魔法！擲出了 6！所有人獲得1回合陷阱免疫，並進貢！",
                    logTribute: (g, r) => `💎 ${g} 給了 ${r} 1 顆寶石。`,
                    logRoyalStop: (n) => `👑 ${n} 使用皇室特權，精準停在龍穴！`,
                    logBounce: (t, n, p) => `${t} ${n} 走過頭了！反彈回到 ${p}。`,
                    logPortal: (t, n, j, p) => `✨ 傳送門！${t} ${n} 獲得了 💎 ${j} 顆寶石並跳躍到 ${p}！`,
                    logScholarClose: (p) => `🦉 知識！學者永久關閉了 ${p} 的傳送門！`,
                    logWerewolfImmune: (p) => `🐺 吼！狼人對 ${p} 的陷阱免疫！（變回人類 👨）`,
                    logFairyWard: (t, n, p) => `🧚 仙女護衛！${t} ${n} 對 ${p} 的陷阱免疫！`,
                    logShielded: (t, n, c, p) => `🛡️ 護盾抵擋！${t} ${n} 消耗 💎 ${c} 顆寶石粉碎了 ${p} 的陷阱！`,
                    logWolfTransform: (n) => `🐺 滿月！${n} 變回了狼人！`,
                    logVampireFeed: (n, p) => `🔥 陷阱！🧛 ${n} 掉落到了 ${p}！吸血鬼在暗中吸血，獲得了 💎 3 顆寶石！`,
                    logVampireSwap: (n1, n2, p) => `🔥 陷阱！🧛 鮮血魔法！${n1} 與 ${n2} 交換了位置！${n2} 被拖下到 ${p}！`,
                    logTrap: (t, n, s, e) => `🔥 陷阱！${t} ${n} 從 ${s} 掉落回 ${e}！`,
                    logScholarTrap: (s, e) => `🦉 煉金術！學者加深了 ${s} 的陷阱！下一個受害者將一直掉落到 ${e}！`,
                    logMoveSafe: (t, n, p) => `${t} ${n} 安全移動到格子 ${p}。`,
                    logMilestone: (t, n, p, a) => `🎁 里程碑！${t} ${n} 跨越了格子 ${p}，找到一個裝有 💎 ${a} 顆寶石的寶箱！`,
                    logMagePortal: (t, n, s, e) => `🌌 鍛造傳送門！${t} ${n} 自動消耗 5 顆寶石撕裂空間，從 ${s} 跳躍到 ${e}！`,
                    logWin: (t, n) => `⚔️ 史詩之戰！⚔️ ${t} ${n} 擊敗了巨龍！`,
                    turnWin: (t, n) => `👑 ${t} ${n} 獲勝！👑`,
                    logNinja: (n) => `🥷 忍者反射！${n} 擲出了 6，獲得額外回合！`,
                    turnIndicator: (t, n) => `${t} ${n} 的回合`
                }
            },
            en: {
                title: "Dragon Warrior Quest 🐉", designer: "Game Design by Colette", rulesTitle: "📜 Quest Rules",
                ruleGoal: "<strong>The Goal:</strong> Reach exactly <span class='hl'>Tile 100</span> to defeat the Dragon! Overshooting bounces you back.",
                rulePortals: "<strong>Portals & Traps:</strong> <span class='hl'>Magic Portals 🌀</span> jump you forward. <span class='hl'>Dragon Traps 🔥</span> drop you backward.",
                ruleShield: "<strong>Jewel Shield:</strong> Spend <span class='hl'>💎 Jewels</span> automatically to shatter a trap and stay safe!",
                ruleMilestone: "<strong>Milestones:</strong> Passing tiles <span class='hl'>25, 50, and 75</span> yields <span class='hl'>Treasure Chests</span> containing Jewels.",
                ruleClasses: "<strong>Hero Classes:</strong> Every Hero has a <span class='hl'>unique ability</span>. Pick your favorite or Randomize!",
                prepBattle: "⚔️ Prepare for Battle ⚔️", btnRandom: "🎲 Randomize", btnStart: "Start Quest", btnMenu: "⬅️ Menu", btnRoll: "Roll Dice 🎲",
                btnAINames: "✨ AI Auto-Name All Players",
                classes: {
                    '🛡️': { name: 'Knight', desc: 'Trap shields cost 1 Jewel. Gains extra +1 Jewel from Milestones.' },
                    '🏹': { name: 'Ranger', desc: '+1 to every dice roll.' },
                    '🧙': { name: 'Mage', desc: 'Earns 3 Jewels from Portals. Auto-spends 5 Jewels to Forge a Portal forward.' },
                    '🥷': { name: 'Ninja', desc: 'Rolling a 6 grants a bonus turn.' },
                    '🧛': { name: 'Vampire', desc: 'Swaps with leader when trapped. If leading, gains 3 Jewels instead.' },
                    '🧚': { name: 'Fairy', desc: 'Starts with 3 Jewels. Rolling 6 shields everyone and taxes 1 Jewel each.' },
                    '🐺': { name: 'Werewolf', desc: 'Immune to 1 Trap as a Wolf. Changes to Human after a trap, and back to Wolf after next.' },
                    '👑': { name: 'Royal', desc: 'Never bounces back at the end of the board.' },
                    '🦉': { name: 'Scholar', desc: 'Closes Portals. Deepens Traps, pushing their destination lower after use.' }
                },
                logs: {
                    logStart: "System: The Quest begins!",
                    logRoll: (t, n, r) => `${t} ${n} rolled a ${r}!`,
                    logRangerBonus: " (+1 Ranger Speed)",
                    logFairyMagic: "🧚 FAIRY MAGIC! Rolled a 6! Everyone gets Trap Immunity for 1 turn, and pays tribute!",
                    logTribute: (g, r) => `💎 ${g} gave 1 Jewel to ${r}.`,
                    logRoyalStop: (n) => `👑 ${n} used Royal privilege to stop exactly at the Lair!`,
                    logBounce: (t, n, p) => `${t} ${n} overshot! Bounced back to ${p}.`,
                    logPortal: (t, n, j, p) => `✨ PORTAL! ${t} ${n} earned 💎 ${j} Jewel(s) and jumped to ${p}!`,
                    logScholarClose: (p) => `🦉 KNOWLEDGE! The Scholar permanently closed the portal at ${p}!`,
                    logWerewolfImmune: (p) => `🐺 ROAR! The Werewolf is immune to the trap at ${p}! (Transforms to Human 👨)`,
                    logFairyWard: (t, n, p) => `🧚 FAIRY WARD! ${t} ${n} is immune to the trap at ${p}!`,
                    logShielded: (t, n, c, p) => `🛡️ SHIELDED! ${t} ${n} spent 💎 ${c} Jewel(s) to shatter the trap at ${p}!`,
                    logWolfTransform: (n) => `🐺 FULL MOON! ${n} transforms back into a Werewolf!`,
                    logVampireFeed: (n, p) => `🔥 TRAP! 🧛 ${n} fell to ${p}! The Vampire fed in the dark and gained 💎 3 Jewels!`,
                    logVampireSwap: (n1, n2, p) => `🔥 TRAP! 🧛 BLOOD MAGIC! ${n1} swapped places with ${n2}! ${n2} is dragged down to ${p}!`,
                    logTrap: (t, n, s, e) => `🔥 TRAP! ${t} ${n} fell from ${s} back to ${e}!`,
                    logScholarTrap: (s, e) => `🦉 ALCHEMY! The Scholar deepened the trap at ${s}! The next victim will fall all the way to ${e}!`,
                    logMoveSafe: (t, n, p) => `${t} ${n} moved safely to tile ${p}.`,
                    logMilestone: (t, n, p, a) => `🎁 MILESTONE! ${t} ${n} crossed tile ${p} and found a Treasure Chest with 💎 ${a} Jewels!`,
                    logMagePortal: (t, n, s, e) => `🌌 FORGE PORTAL! ${t} ${n} automatically spent 5 Jewels and ripped space to jump from ${s} to ${e}!`,
                    logWin: (t, n) => `⚔️ EPIC BATTLE! ⚔️ ${t} ${n} defeated the Dragon!`,
                    turnWin: (t, n) => `👑 ${t} ${n} WINS! 👑`,
                    logNinja: (n) => `🥷 NINJA REFLEXES! ${n} rolled a 6 and gets a bonus turn!`,
                    turnIndicator: (t, n) => `${t} ${n}'s Turn`
                }
            },
            ja: {
                title: "ドラゴンウォリアークエスト 🐉", designer: "ゲームデザイン: Colette", rulesTitle: "📜 クエストのルール",
                ruleGoal: "<strong>目標:</strong> 正確に <span class='hl'>100マス目</span> に到達してドラゴンを倒せ！行き過ぎると戻される。",
                rulePortals: "<strong>ポータルと罠:</strong> <span class='hl'>魔法のポータル 🌀</span> は前進。<span class='hl'>ドラゴンの罠 🔥</span> は後退。",
                ruleShield: "<strong>宝石の盾:</strong> 自動で <span class='hl'>💎 宝石</span> を消費して罠を破壊し、安全を確保！",
                ruleMilestone: "<strong>マイルストーン:</strong> <span class='hl'>25, 50, 75</span> マスを通過すると宝石入りの <span class='hl'>宝箱</span> を獲得。",
                ruleClasses: "<strong>ヒーロークラス:</strong> 全てのヒーローに <span class='hl'>固有の能力</span> がある！選ぶかランダムで決めよう！",
                prepBattle: "⚔️ 戦闘の準備 ⚔️", btnRandom: "🎲 ランダム", btnStart: "クエスト開始", btnMenu: "⬅️ メニュー", btnRoll: "サイコロを振る 🎲",
                btnAINames: "✨ AIで全プレイヤーの名前を生成",
                classes: {
                    '🛡️': { name: '騎士', desc: '盾のコストが1宝石。宝箱から+1宝石。' },
                    '🏹': { name: 'レンジャー', desc: 'サイコロの目に常に+1。' },
                    '🧙': { name: '魔法使い', desc: 'ポータルで3宝石獲得。5宝石を自動消費し前方へワープ。' },
                    '🥷': { name: '忍者', desc: '6を出すと追加ターン。' },
                    '🧛': { name: '吸血鬼', desc: '罠にかかると先頭のプレイヤーと場所を入れ替える。自身が先頭なら3宝石獲得。' },
                    '🧚': { name: '妖精', desc: '初期宝石3。6を出すと全員に盾を付与し、各プレイヤーから1宝石徴収。' },
                    '🐺': { name: '人狼', desc: '狼形態で罠を1回無効化。罠後人間に戻り、次の罠で再び狼になる。' },
                    '👑': { name: '王族', desc: 'ゴールで行き過ぎても戻されない。' },
                    '🦉': { name: '学者', desc: '使用後ポータルを閉じる。罠を深くし、落下先をさらに下へ移動させる。' }
                },
                logs: {
                    logStart: "システム: クエスト開始！",
                    logRoll: (t, n, r) => `${t} ${n} は ${r} を出した！`,
                    logRangerBonus: " (+1 レンジャースピード)",
                    logFairyMagic: "🧚 妖精の魔法！6を出した！全員が1ターンの罠免疫を得て、貢ぎ物を支払う！",
                    logTribute: (g, r) => `💎 ${g} が ${r} に1宝石を渡した。`,
                    logRoyalStop: (n) => `👑 ${n} は王族の特権を使い、ドラゴンの巣にぴったり止まった！`,
                    logBounce: (t, n, p) => `${t} ${n} は行き過ぎた！ ${p} に戻される。`,
                    logPortal: (t, n, j, p) => `✨ ポータル！${t} ${n} は 💎 ${j} 宝石を獲得し、 ${p} にワープした！`,
                    logScholarClose: (p) => `🦉 知識！学者が ${p} のポータルを永久に閉じた！`,
                    logWerewolfImmune: (p) => `🐺 ガオー！人狼は ${p} の罠を無効化した！（人間に戻る 👨）`,
                    logFairyWard: (t, n, p) => `🧚 妖精の守護！${t} ${n} は ${p} の罠を無効化した！`,
                    logShielded: (t, n, c, p) => `🛡️ 盾発動！${t} ${n} は 💎 ${c} 宝石を消費し、 ${p} の罠を破壊した！`,
                    logWolfTransform: (n) => `🐺 満月！${n} は人狼に戻った！`,
                    logVampireFeed: (n, p) => `🔥 罠！🧛 ${n} は ${p} に落ちた！吸血鬼は闇の中で血を吸い、💎 3 宝石を獲得した！`,
                    logVampireSwap: (n1, n2, p) => `🔥 罠！🧛 血の魔法！${n1} は ${n2} と場所を入れ替えた！${n2} は ${p} に引きずり落とされた！`,
                    logTrap: (t, n, s, e) => `🔥 罠！${t} ${n} は ${s} から ${e} に落ちた！`,
                    logScholarTrap: (s, e) => `🦉 錬金術！学者が ${s} の罠を深くした！次の犠牲者は ${e} まで落ちるだろう！`,
                    logMoveSafe: (t, n, p) => `${t} ${n} は安全にマス ${p} に移動した。`,
                    logMilestone: (t, n, p, a) => `🎁 マイルストーン！${t} ${n} はマス ${p} を通過し、💎 ${a} 宝石入りの宝箱を見つけた！`,
                    logMagePortal: (t, n, s, e) => `🌌 空間創造！${t} ${n} は自動で5宝石を消費し、空間を裂いて ${s} から ${e} にワープした！`,
                    logWin: (t, n) => `⚔️ 壮絶な戦い！⚔️ ${t} ${n} はドラゴンを倒した！`,
                    turnWin: (t, n) => `👑 ${t} ${n} の勝利！👑`,
                    logNinja: (n) => `🥷 忍者の反射神経！${n} は6を出し、追加ターンを得た！`,
                    turnIndicator: (t, n) => `${t} ${n}のターン`
                }
            },
            es: {
                title: "Búsqueda del Guerrero Dragón 🐉", designer: "Diseño de juego por Colette", rulesTitle: "📜 Reglas de la Misión",
                ruleGoal: "<strong>El Objetivo:</strong> ¡Llega exactamente a la <span class='hl'>Casilla 100</span> para vencer al Dragón! Si te pasas, rebotas.",
                rulePortals: "<strong>Portales y Trampas:</strong> Los <span class='hl'>Portales Mágicos 🌀</span> te adelantan. Las <span class='hl'>Trampas de Dragón 🔥</span> te retrasan.",
                ruleShield: "<strong>Escudo de Joyas:</strong> ¡Gasta automáticamente <span class='hl'>💎 Joyas</span> para destruir una trampa y mantenerte a salvo!",
                ruleMilestone: "<strong>Hitos:</strong> Pasar las casillas <span class='hl'>25, 50 y 75</span> te otorga <span class='hl'>Cofres del Tesoro</span> con Joyas.",
                ruleClasses: "<strong>Clases de Héroes:</strong> Cada Héroe tiene una <span class='hl'>habilidad única</span>. ¡Elige o hazlo Aleatorio!",
                prepBattle: "⚔️ Prepárate para la Batalla ⚔️", btnRandom: "🎲 Aleatorio", btnStart: "Iniciar Misión", btnMenu: "⬅️ Menú", btnRoll: "Tirar Dado 🎲",
                btnAINames: "✨ IA Auto-nombrar a todos",
                classes: {
                    '🛡️': { name: 'Caballero', desc: 'El escudo cuesta 1 Joya. Gana +1 Joya extra de los Cofres.' },
                    '🏹': { name: 'Explorador', desc: '+1 a cada tirada de dado.' },
                    '🧙': { name: 'Mago', desc: 'Gana 3 Joyas en Portales. Gasta 5 Joyas auto para forjar un portal adelante.' },
                    '🥷': { name: 'Ninja', desc: 'Sacar un 6 otorga un turno extra.' },
                    '🧛': { name: 'Vampiro', desc: 'Cambia posición con el líder en trampas. Si lidera, gana 3 Joyas.' },
                    '🧚': { name: 'Hada', desc: 'Empieza con 3 Joyas. Sacar 6 escuda a todos y le pagan 1 Joya cada uno.' },
                    '🐺': { name: 'Hombre Lobo', desc: 'Inmune a 1 trampa como Lobo. Cambia a Humano tras una trampa, y vuelve a Lobo en la siguiente.' },
                    '👑': { name: 'Realeza', desc: 'Nunca rebota al final del tablero.' },
                    '🦉': { name: 'Erudito', desc: 'Cierra Portales tras usarlos. Profundiza las Trampas, bajando su destino.' }
                },
                logs: {
                    logStart: "Sistema: ¡La misión comienza!",
                    logRoll: (t, n, r) => `¡${t} ${n} sacó un ${r}!`,
                    logRangerBonus: " (+1 Velocidad de Explorador)",
                    logFairyMagic: "🧚 ¡MAGIA DE HADA! ¡Sacó un 6! ¡Todos obtienen Inmunidad a Trampas por 1 turno y pagan tributo!",
                    logTribute: (g, r) => `💎 ${g} le dio 1 Joya a ${r}.`,
                    logRoyalStop: (n) => `👑 ¡${n} usó el privilegio Real para detenerse exactamente en la Guarida!`,
                    logBounce: (t, n, p) => `¡${t} ${n} se pasó! Rebotó a la casilla ${p}.`,
                    logPortal: (t, n, j, p) => `✨ ¡PORTAL! ¡${t} ${n} ganó 💎 ${j} Joya(s) y saltó a ${p}!`,
                    logScholarClose: (p) => `🦉 ¡CONOCIMIENTO! ¡El Erudito cerró permanentemente el portal en ${p}!`,
                    logWerewolfImmune: (p) => `🐺 ¡ROAR! ¡El Hombre Lobo es inmune a la trampa en ${p}! (Se transforma en Humano 👨)`,
                    logFairyWard: (t, n, p) => `🧚 ¡PROTECCIÓN DE HADA! ¡${t} ${n} es inmune a la trampa en ${p}!`,
                    logShielded: (t, n, c, p) => `🛡️ ¡ESCUDADO! ¡${t} ${n} gastó 💎 ${c} Joya(s) para destruir la trampa en ${p}!`,
                    logWolfTransform: (n) => `🐺 ¡LUNA LLENA! ¡${n} se transforma de nuevo en Hombre Lobo!`,
                    logVampireFeed: (n, p) => `🔥 ¡TRAMPA! 🧛 ¡${n} cayó a ${p}! ¡El Vampiro se alimentó en la oscuridad y ganó 💎 3 Joyas!`,
                    logVampireSwap: (n1, n2, p) => `🔥 ¡TRAMPA! 🧛 ¡MAGIA DE SANGRE! ¡${n1} intercambió lugar con ${n2}! ¡${n2} es arrastrado hacia abajo a ${p}!`,
                    logTrap: (t, n, s, e) => `🔥 ¡TRAMPA! ¡${t} ${n} cayó desde ${s} hasta ${e}!`,
                    logScholarTrap: (s, e) => `🦉 ¡ALQUIMIA! ¡El Erudito profundizó la trampa en ${s}! ¡La próxima víctima caerá hasta ${e}!`,
                    logMoveSafe: (t, n, p) => `${t} ${n} se movió con seguridad a la casilla ${p}.`,
                    logMilestone: (t, n, p, a) => `🎁 ¡HITO! ¡${t} ${n} cruzó la casilla ${p} y encontró un Cofre del Tesoro con 💎 ${a} Joyas!`,
                    logMagePortal: (t, n, s, e) => `🌌 ¡FORJAR PORTAL! ¡${t} ${n} gastó automáticamente 5 Joyas y abrió el espacio para saltar de ${s} a ${e}!`,
                    logWin: (t, n) => `⚔️ ¡BATALLA ÉPICA! ⚔️ ¡${t} ${n} derrotó al Dragón!`,
                    turnWin: (t, n) => `👑 ¡${t} ${n} GANA! 👑`,
                    logNinja: (n) => `🥷 ¡REFLEJOS NINJA! ¡${n} sacó un 6 y obtiene un turno extra!`,
                    turnIndicator: (t, n) => `Turno de ${t} ${n}`
                }
            }
        };

        let currentLang = 'zh';
        
        function changeLanguage() {
            currentLang = document.getElementById('lang-select').value;
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (i18n[currentLang][key]) el.innerHTML = i18n[currentLang][key];
            });
            if (document.getElementById('setup-screen').style.display !== 'none') {
                updatePlayerInputs();
            } else {
                updateUI();
            }
        }
        // ==========================================

        const WINNING_TILE = 100;
        const COLORS = ['#e74c3c', '#3498db', '#9b59b6', '#2ecc71']; 
        const HERO_KEYS = ['🛡️', '🏹', '🧙', '🥷', '🧛', '🧚', '🐺', '👑', '🦉'];
        
        let PORTALS = {}; 
        let TRAPS = {};  
        let players = [];
        let currentPlayerIndex = 0;
        let gameWon = false;

        window.onload = function() {
            document.getElementById('lang-select').value = currentLang;
            changeLanguage();
        };

        function changeHeroDesc(playerIndex) {
            const selectedIcon = document.getElementById(`p${playerIndex}-icon`).value;
            const descSpan = document.getElementById(`p${playerIndex}-desc`);
            descSpan.innerText = i18n[currentLang].classes[selectedIcon].desc;
            
            const nameInput = document.getElementById(`p${playerIndex}-name`);
            nameInput.value = i18n[currentLang].classes[selectedIcon].name;
        }

        function updatePlayerInputs() {
            const count = document.getElementById('player-count').value;
            const container = document.getElementById('player-inputs');
            
            const currentNames = [];
            for (let i = 1; i <= 4; i++) {
                const input = document.getElementById(`p${i}-name`);
                currentNames[i] = input ? input.value : null;
            }

            container.innerHTML = '';
            
            let iconOptionsHTML = '';
            for (const icon of HERO_KEYS) {
                iconOptionsHTML += `<option value="${icon}">${icon} ${i18n[currentLang].classes[icon].name}</option>`;
            }

            for (let i = 1; i <= count; i++) {
                let defaultName = currentNames[i] || i18n[currentLang].classes['🛡️'].name;
                container.innerHTML += `
                    <div class="player-setup-box">
                        <div class="player-row">
                            <select id="p${i}-icon" onchange="changeHeroDesc(${i})" style="flex: 1; min-width: 120px;">${iconOptionsHTML}</select>
                            <input type="text" id="p${i}-name" placeholder="Name" value="${defaultName}" style="flex: 2; min-width: 150px;">
                        </div>
                        <span id="p${i}-desc" class="skill-desc">${i18n[currentLang].classes['🛡️'].desc}</span>
                    </div>`;
            }
        }

        function randomizeHeroes() {
            const count = document.getElementById('player-count').value;
            for (let i = 1; i <= count; i++) {
                const selectElement = document.getElementById(`p${i}-icon`);
                const randomIcon = HERO_KEYS[Math.floor(Math.random() * HERO_KEYS.length)];
                selectElement.value = randomIcon;
                changeHeroDesc(i);
            }
        }

        function resetGame() {
            players = [];
            currentPlayerIndex = 0;
            gameWon = false;
            
            document.getElementById('game-screen').style.display = 'none';
            document.getElementById('setup-screen').style.display = 'block';
            
            document.getElementById('board').innerHTML = '';
            document.getElementById('log').innerHTML = '';
            document.getElementById('stats-container').innerHTML = '';
            document.getElementById('dice-result').innerText = '';
            document.getElementById('roll-btn').style.display = 'inline-block';
            
            updatePlayerInputs(); 
        }

        function generateRandomMaze() {
            PORTALS = {}; TRAPS = {};
            let usedTiles = new Set([1, WINNING_TILE]); 

            for(let i = 0; i < 8; i++) {
                let start = getRandomTile(2, 80, usedTiles); usedTiles.add(start);
                let end = getRandomTile(start + 10, 95, usedTiles); PORTALS[start] = end;
            }
            for(let i = 0; i < 8; i++) {
                let start = getRandomTile(20, 98, usedTiles); usedTiles.add(start);
                let end = getRandomTile(5, start - 10, usedTiles); TRAPS[start] = end;
            }
        }

        function getRandomTile(min, max, excludeSet) {
            let tile;
            do { tile = Math.floor(Math.random() * (max - min + 1)) + min; } while (excludeSet.has(tile));
            return tile;
        }

        function startGame() {
            const count = document.getElementById('player-count').value;
            for (let i = 1; i <= count; i++) {
                let name = document.getElementById(`p${i}-name`).value || `Hero ${i}`;
                let icon = document.getElementById(`p${i}-icon`).value;
                let initialJewels = (icon === '🧚') ? 3 : 0; 
                players.push({ 
                    name: name, position: 1, jewels: initialJewels, token: icon, color: COLORS[i-1],
                    milestones: { 25: false, 50: false, 75: false },
                    fairyWardTurns: 0,
                    isWerewolf: (icon === '🐺') ? true : false 
                });
            }
            
            generateRandomMaze(); 
            
            document.getElementById('setup-screen').style.display = 'none';
            document.getElementById('game-screen').style.display = 'block';
            
            createBoard(); updateUI();
            logMessage(i18n[currentLang].logs.logStart);
        }

        function createBoard() {
            const board = document.getElementById('board');
            board.innerHTML = ''; 
            for (let row = 9; row >= 0; row--) {
                for (let col = 0; col < 10; col++) {
                    let tileNum = (row % 2 !== 0) ? (row * 10) + col + 1 : (row * 10) + (9 - col) + 1; 
                    
                    let tile = document.createElement('div');
                    tile.className = 'tile';
                    tile.id = 'tile-' + tileNum;
                    
                    let numLabel = document.createElement('span');
                    numLabel.innerText = tileNum;
                    numLabel.style.position = 'relative';
                    numLabel.style.zIndex = '2';
                    tile.appendChild(numLabel);

                    if (PORTALS[tileNum]) {
                        tile.classList.add('portal');
                        let dest = document.createElement('div');
                        dest.className = 'dest-label';
                        dest.innerText = `↗ ${PORTALS[tileNum]}`;
                        tile.appendChild(dest);
                    }
                    if (TRAPS[tileNum]) {
                        tile.classList.add('trap');
                        let dest = document.createElement('div');
                        dest.className = 'dest-label';
                        dest.innerText = `↘ ${TRAPS[tileNum]}`;
                        tile.appendChild(dest);
                    }
                    
                    if (tileNum === 1) tile.classList.add('start');
                    if (tileNum === WINNING_TILE) { 
                        tile.classList.add('end'); 
                        numLabel.innerText = '🐉'; 
                    }
                    
                    board.appendChild(tile);
                }
            }
        }

        function checkMilestones(p, newPos) {
            const tiers = [25, 50, 75];
            tiers.forEach(ms => {
                if (newPos >= ms && !p.milestones[ms]) {
                    p.milestones[ms] = true;
                    let amount = (p.token === '🛡️') ? 3 : 2; 
                    p.jewels += amount;
                    logMessage(i18n[currentLang].logs.logMilestone(p.token, p.name, ms, amount));
                }
            });
        }

        function takeTurn() {
            if (gameWon) return;

            let p = players[currentPlayerIndex];
            let displayToken = (p.token === '🐺' && !p.isWerewolf) ? '👨' : p.token;
            let baseRoll = Math.floor(Math.random() * 6) + 1;
            let moveAmount = baseRoll;
            
            let rollMsg = i18n[currentLang].logs.logRoll(displayToken, p.name, baseRoll);

            if (p.token === '🏹') { 
                moveAmount += 1; 
                rollMsg += i18n[currentLang].logs.logRangerBonus; 
            }
            
            if (p.token === '🧚' && baseRoll === 6) {
                logMessage(i18n[currentLang].logs.logFairyMagic);
                players.forEach(op => {
                    op.fairyWardTurns = (op === p) ? 2 : 1; 
                    if (op !== p && op.jewels > 0) {
                        op.jewels--;
                        p.jewels++;
                        logMessage(i18n[currentLang].logs.logTribute(op.name, p.name));
                    }
                });
            }

            document.getElementById('dice-result').innerText = rollMsg;
            
            p.position += moveAmount;

            if (p.position > WINNING_TILE) {
                if (p.token === '👑') {
                    p.position = WINNING_TILE;
                    logMessage(i18n[currentLang].logs.logRoyalStop(p.name));
                } else {
                    p.position = WINNING_TILE - (p.position - WINNING_TILE);
                    logMessage(i18n[currentLang].logs.logBounce(displayToken, p.name, p.position));
                }
            }

            if (PORTALS[p.position]) {
                let portalStart = p.position;
                let earnedJewels = (p.token === '🧙') ? 3 : 1; 
                p.jewels += earnedJewels;
                logMessage(i18n[currentLang].logs.logPortal(displayToken, p.name, earnedJewels, PORTALS[p.position]));
                p.position = PORTALS[p.position];

                if (p.token === '🦉') {
                    delete PORTALS[portalStart];
                    logMessage(i18n[currentLang].logs.logScholarClose(portalStart));
                    let oldTile = document.getElementById('tile-' + portalStart);
                    if (oldTile) {
                        oldTile.classList.remove('portal');
                        let destLabel = oldTile.querySelector('.dest-label');
                        if (destLabel) destLabel.remove();
                    }
                }
            } 
            else if (TRAPS[p.position]) {
                let trapStart = p.position;
                let trapEnd = TRAPS[trapStart];
                let shieldCost = (p.token === '🛡️') ? 1 : 3; 

                if (p.token === '🐺' && p.isWerewolf) {
                    logMessage(i18n[currentLang].logs.logWerewolfImmune(p.position));
                    p.isWerewolf = false; 
                } 
                else if (p.fairyWardTurns > 0) {
                    logMessage(i18n[currentLang].logs.logFairyWard(displayToken, p.name, p.position));
                    p.fairyWardTurns = 0; 
                }
                else if (p.jewels >= shieldCost) {
                    p.jewels -= shieldCost;
                    logMessage(i18n[currentLang].logs.logShielded(displayToken, p.name, shieldCost, p.position));
                    if (p.token === '🐺' && !p.isWerewolf) {
                        p.isWerewolf = true; 
                        logMessage(i18n[currentLang].logs.logWolfTransform(p.name));
                    }
                } 
                else {
                    if (p.token === '🧛') {
                        let highestPlayer = p;
                        players.forEach(other => { if (other.position > highestPlayer.position) highestPlayer = other; });

                        if (highestPlayer === p) {
                            p.position = trapEnd;
                            p.jewels += 3; 
                            logMessage(i18n[currentLang].logs.logVampireFeed(p.name, trapEnd));
                        } else {
                            p.position = highestPlayer.position;
                            highestPlayer.position = trapEnd;
                            logMessage(i18n[currentLang].logs.logVampireSwap(p.name, highestPlayer.name, trapEnd));
                        }
                    } else {
                        logMessage(i18n[currentLang].logs.logTrap(displayToken, p.name, trapStart, trapEnd));
                        p.position = trapEnd;
                    }
                    
                    if (p.token === '🐺' && !p.isWerewolf) {
                        p.isWerewolf = true; 
                        logMessage(i18n[currentLang].logs.logWolfTransform(p.name));
                    }
                }

                if (p.token === '🦉') {
                    let validLowerDests = [];
                    for (let i = 2; i < trapEnd; i++) {
                        validLowerDests.push(i);
                    }
                    if (validLowerDests.length > 0) {
                        let randomIndex = Math.floor(Math.random() * validLowerDests.length);
                        let newTrapEnd = validLowerDests[randomIndex];
                        TRAPS[trapStart] = newTrapEnd;
                        logMessage(i18n[currentLang].logs.logScholarTrap(trapStart, newTrapEnd));
                        
                        let trapTile = document.getElementById('tile-' + trapStart);
                        if (trapTile) {
                            let destLabel = trapTile.querySelector('.dest-label');
                            if (destLabel) destLabel.innerText = `↘ ${newTrapEnd}`;
                        }
                    }
                }
            } else {
                logMessage(i18n[currentLang].logs.logMoveSafe(displayToken, p.name, p.position));
            }

            checkMilestones(p, p.position);

            if (p.token === '🧙' && p.jewels >= 5 && p.position < WINNING_TILE) {
                p.jewels -= 5;
                let minTarget = Math.min(WINNING_TILE, p.position + 6);
                let maxTarget = WINNING_TILE;
                let target = Math.floor(Math.random() * (maxTarget - minTarget + 1)) + minTarget;
                
                logMessage(i18n[currentLang].logs.logMagePortal(p.token, p.name, p.position, target));
                p.position = target;
                
                checkMilestones(p, p.position); 
            }

            updateUI();

            if (p.position === WINNING_TILE) {
                gameWon = true;
                document.getElementById('roll-btn').style.display = 'none';
                logMessage(i18n[currentLang].logs.logWin(displayToken, p.name));
                document.getElementById('turn-indicator').innerHTML = i18n[currentLang].logs.turnWin(displayToken, p.name);
                return;
            }

            if (p.fairyWardTurns > 0) p.fairyWardTurns--;

            if (p.token === '🥷' && baseRoll === 6) {
                logMessage(i18n[currentLang].logs.logNinja(p.name));
            } else {
                currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
            }
            
            updateTurnIndicator();
        }

        function updateUI() {
            let statsHTML = '';
            players.forEach(p => {
                let displayToken = (p.token === '🐺' && !p.isWerewolf) ? '👨' : p.token;
                let wardIcon = (p.fairyWardTurns > 0) ? ' 🧚🛡️' : '';
                let className = i18n[currentLang].classes[p.token].name;
                let classDesc = i18n[currentLang].classes[p.token].desc;
                
                statsHTML += `
                <div class="player-stat" style="border-left: 4px solid ${p.color}">
                    <div class="stat-header">
                        <span>${displayToken} ${p.name}${wardIcon}</span>
                        <span>💎 ${p.jewels} | Tile: ${p.position}</span>
                    </div>
                    <span class="stat-ability"><strong>${className}:</strong> ${classDesc}</span>
                </div>`;
            });
            document.getElementById('stats-container').innerHTML = statsHTML;

            document.querySelectorAll('.player-token').forEach(e => e.remove());

            players.forEach((p, index) => {
                let tile = document.getElementById('tile-' + p.position);
                if(tile) {
                    let token = document.createElement('div');
                    token.className = 'player-token';
                    token.innerText = (p.token === '🐺' && !p.isWerewolf) ? '👨' : p.token;
                    token.style.transform = `translate(${(index % 2 === 0 ? 1 : -1) * 4}px, ${(index > 1 ? 1 : -1) * 4}px)`;
                    tile.appendChild(token);
                }
            });

            updateTurnIndicator();
        }

        function updateTurnIndicator() {
            if(!gameWon) {
                let p = players[currentPlayerIndex];
                let displayToken = (p.token === '🐺' && !p.isWerewolf) ? '👨' : p.token;
                document.getElementById('turn-indicator').innerHTML = i18n[currentLang].logs.turnIndicator(displayToken, p.name);
                document.getElementById('turn-indicator').style.color = p.color;
            }
        }

        function logMessage(msg) {
            const log = document.getElementById('log');
            log.innerHTML = `<div>> ${msg}</div>` + log.innerHTML;
        }
    </script>
</body>
</html>