export default {
  // 1. PAGINATED CRAWLER ENGINE
  async runCrawler(env) {
    let offset = 0;
    const limit = 100;
    let totalScraped = 0;
    let totalSaved = 0;
    let hasMorePages = true;
    
    try {
      if (!env.car_db) {
        return { success: false, message: "Production binding error: 'car_db' is missing." };
      }

      const stmt = env.car_db.prepare(
        `INSERT OR REPLACE INTO cars (id, brand, model, year, price_hkd, original_price, is_hybrid, url, is_sold, mileage, engine_cc, previous_owners) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      while (hasMorePages) {
        const secretApiUrl = `https://www.dchucc.com/admin/api/car/available?offset=${offset}&limit=${limit}&order_by=default&sort=desc`;
        
        const response = await fetch(secretApiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'application/json',
            'X-Api-Key': 'TwTVFEi7kGyLCp7GVCa8qEuLzEwiuJXd'
          }
        });
        
        const apiData = await response.json();
        const rawCars = apiData.data || apiData.items || apiData.results || apiData;
        
        if (!Array.isArray(rawCars) || rawCars.length === 0) {
          hasMorePages = false;
          break;
        }

        totalScraped += rawCars.length;

        for (const car of rawCars) {
          const v = car.vehicle || {};
          let brandName = v.make ? v.make.trim() : "Unknown";
          if (brandName !== "Unknown") {
            brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase();
          }

          const textToSearch = `${v.engineType || ''} ${car.description || ''} ${car.descriptionEn || ''} ${car.equipments || ''}`.toLowerCase();
          const isHybrid = textToSearch.includes('hybrid') || textToSearch.includes('混合動力') || textToSearch.includes('e-power');
          const isSoldStatus = car.isSold === true || v.isSold === true ? 1 : 0;

          const rawSellingPrice = parseInt(v.sellingPrice) || 0;
          const rawDiscountedPrice = parseInt(v.discountedPrice) || 0;
          
          let finalPricePayable = rawSellingPrice;
          let regularOriginalPrice = 0;

          if (rawDiscountedPrice > 0 && rawDiscountedPrice < rawSellingPrice) {
            finalPricePayable = rawDiscountedPrice;
            regularOriginalPrice = rawSellingPrice;
          }

          if (brandName !== "Unknown" && finalPricePayable > 0) {
            await stmt.bind(
              String(car.id || v.id),
              brandName,
              v.model || "Unknown",
              parseInt(v.year) || 0,
              finalPricePayable,
              regularOriginalPrice,
              isHybrid ? 1 : 0,
              `https://www.dchucc.com/tc/car-info/${car.id || ''}`,
              isSoldStatus,
              parseInt(v.mileage) || 0,
              parseInt(v.cylinderCapacity) || 0,
              parseInt(v.previousOwners) || 0
            ).run();
            totalSaved++;
          }
        }

        if (rawCars.length < limit) {
          hasMorePages = false;
        } else {
          offset += limit;
        }
      }

      return { 
        success: true, 
        message: `Wrangler Sync complete. Evaluated ${totalScraped} listings. Stored ${totalSaved} unique cars.` 
      };

    } catch (e) {
      return { success: false, message: `Scraper error: ${e.message}` };
    }
  },

  // 2. AUTOMATED BACKGROUND TIMER (Cron Trigger)
  async scheduled(event, env, ctx) {
    await this.runCrawler(env);
  },

  // 3. THE MAIN ROUTER
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/crawl') {
      const crawlResults = await this.runCrawler(env);
      return new Response(JSON.stringify(crawlResults), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === '/api/reset') {
      try {
        await env.car_db.prepare("DELETE FROM cars;").run();
        return new Response(JSON.stringify({ success: true, message: "Database wiped completely." }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    if (url.pathname === '/api/search') {
      const userQuery = url.searchParams.get("query") || ""; 
      const normalizedQuery = userQuery.toLowerCase().trim();
      
      // Enforce default base structure
      let filters = { brands: [], min_year: null, max_year: null, is_hybrid: null, on_sale: null };

      if (normalizedQuery !== "") {
        const systemPrompt = `You are a car database assistant. Convert the user's request into a strict JSON object with these exact keys: 'brands' (array of strings, e.g., ["Honda", "Toyota"]), 'min_year' (integer), 'max_year' (integer), 'is_hybrid' (boolean or null), 'on_sale' (boolean or null). The current year is 2026.
        - Set 'on_sale' to true if the request contains keywords like: sale, discount, promo, special price, bargain, 特價, 減價.
        - Set 'is_hybrid' to true if the request contains keywords like: hybrid, e-power, e:hev, 混合動力.
        Only output valid JSON, nothing else. Do not wrap output in markdown blocks.`;
        
        const aiResponse = await env.AI.run('@cf/qwen/qwen3-30b-a3b-fp8', {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery }
          ]
        });

        try {
          let rawText = typeof aiResponse.response === 'string' ? aiResponse.response : JSON.stringify(aiResponse.response);
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            // Merge matching values back to retain structural keys integrity
            filters = { ...filters, ...parsed };
          }
        } catch (error) {
          // Quiet fallback to programmatic rules if parsing exceptions hit
        }
      }

      // 🛑 REINFORCED CODE SAFEGUARD (Guarantees matching metrics even if AI misses them)
      if (normalizedQuery.includes('sale') || normalizedQuery.includes('discount') || normalizedQuery.includes('promo') || normalizedQuery.includes('特價') || normalizedQuery.includes('減價')) {
        filters.on_sale = true;
      }
      if (normalizedQuery.includes('hybrid') || normalizedQuery.includes('e-power') || normalizedQuery.includes('e:hev') || normalizedQuery.includes('混合動力')) {
        filters.is_hybrid = true;
      }

      // Build Dynamic SQL Query Dataset
      let sql = "SELECT * FROM cars WHERE 1=1";
      const params = [];

      if (filters.min_year) { sql += ` AND year >= ?`; params.push(filters.min_year); }
      if (filters.max_year) { sql += ` AND year <= ?`; params.push(filters.max_year); }
      if (filters.is_hybrid === true) { sql += ` AND is_hybrid = ?`; params.push(1); }
      if (filters.on_sale === true) { sql += ` AND original_price > 0`; }
      
      if (filters.brands && Array.isArray(filters.brands) && filters.brands.length > 0) {
        const placeholders = filters.brands.map(() => '?').join(',');
        sql += ` AND brand IN (${placeholders})`;
        params.push(...filters.brands);
      }
      
      const { results } = await env.car_db.prepare(sql).bind(...params).all();
      return new Response(JSON.stringify({ success: true, ai_filters: filters, results: results }), { 
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
      });
    }

    // FRONTEND INTERFACE HTML UI
    const htmlUI = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Intelligent Car Copilot</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-slate-900 text-slate-100 font-sans min-h-screen">
        <div class="max-w-6xl mx-auto px-4 py-8">
            
            <header class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10 border-b border-slate-800 pb-5">
                <div class="flex items-center space-x-3">
                    <i class="fa-solid fa-car-side text-sky-400 text-3xl"></i>
                    <h1 class="text-2xl font-bold tracking-tight">AI Car <span class="text-sky-400">Copilot</span></h1>
                </div>
                
                <div class="flex items-center space-x-2">
                    <button onclick="triggerReset()" id="resetBtn" class="bg-rose-950/20 hover:bg-rose-950/50 text-rose-400 font-semibold px-4 py-2 rounded-lg text-sm transition flex items-center space-x-2 border border-rose-900/30 shadow-sm cursor-pointer">
                        <i class="fa-solid fa-trash-can"></i> <span>Reset Slate</span>
                    </button>
                    <button onclick="triggerCrawl()" id="crawlBtn" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-lg text-sm transition flex items-center space-x-2 border border-slate-700/60 shadow-sm cursor-pointer">
                        <i class="fa-solid fa-rotate"></i> <span>Sync DCH UCC Data</span>
                    </button>
                </div>
            </header>

            <section class="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50 shadow-xl mb-8">
                <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-medium text-slate-400 tracking-wide uppercase">Describe your ideal car</label>
                    <button onclick="saveCurrentAsSuggestion()" class="text-xs font-bold text-sky-400 hover:text-sky-300 transition flex items-center space-x-1 cursor-pointer">
                        <i class="fa-solid fa-bookmark"></i> <span>Save query as badge</span>
                    </button>
                </div>
                
                <div class="flex flex-col md:flex-row gap-3">
                    <input type="text" id="queryInput" 
                        placeholder="e.g., Nissan e-power car..." 
                        class="flex-1 bg-slate-950/80 border border-slate-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-sky-500 transition shadow-inner placeholder-slate-500">
                    <button onclick="searchCars()" id="searchBtn" class="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3.5 rounded-xl transition shadow-lg flex items-center justify-center space-x-2 shrink-0 cursor-pointer">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> <span>Analyze with AI</span>
                    </button>
                </div>

                <div class="mt-4 flex flex-col gap-3 pt-3 border-t border-slate-700/30">
                    <div class="flex flex-wrap gap-2 items-center text-xs text-slate-400">
                        <span class="font-medium shrink-0">Tags:</span>
                        <div id="suggestionTray" class="flex flex-wrap gap-1.5"></div>
                    </div>
                    
                    <div class="flex justify-end">
                        <label class="inline-flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/40 hover:bg-slate-900 transition">
                            <input type="checkbox" id="hideSoldToggle" onchange="displayCars()" class="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0 w-4 h-4">
                            <span>Hide Sold Inventory (隱藏已售)</span>
                        </label>
                    </div>
                </div>
            </section>

            <div id="filterStatus" class="hidden bg-slate-800/30 border border-slate-800 rounded-xl px-4 py-2.5 mb-6 text-xs text-slate-400 flex items-center justify-between">
                <div>AI Parsed Target Filters: <span id="aiFiltersText" class="font-mono text-sky-400"></span></div>
                <div id="matchCount" class="font-semibold text-slate-200"></div>
            </div>

            <div id="loader" class="hidden flex flex-col items-center justify-center py-20 space-y-3">
                <div class="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm text-slate-400 animate-pulse">Qwen AI parsing query parameters...</p>
            </div>

            <main id="carGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></main>
        </div>

        <script>
            let cachedCars = [];
            
            const DEFAULT_SUGGESTIONS = [
                "Japanese hybrid under 10 years",
                "Toyota or Honda built after 2020",
                "Nissan e-power car"
            ];

            function getCustomSuggestions() {
                const stored = localStorage.getItem('custom_car_prompts');
                return stored ? JSON.parse(stored) : [];
            }

            function renderSuggestions() {
                const tray = document.getElementById('suggestionTray');
                tray.innerHTML = '';
                
                DEFAULT_SUGGESTIONS.forEach(text => {
                    createTagElement(tray, text, false);
                });

                getCustomSuggestions().forEach(text => {
                    createTagElement(tray, text, true);
                });
            }

            function createTagElement(tray, text, canDelete) {
                const wrapper = document.createElement('div');
                wrapper.className = "inline-flex items-center bg-slate-900 border border-slate-700/60 rounded-md text-slate-300 overflow-hidden text-[11px] font-medium shadow-sm hover:border-slate-600 transition";
                
                const labelBtn = document.createElement('button');
                labelBtn.className = "px-2.5 py-1 text-left cursor-pointer hover:text-white";
                labelBtn.innerText = text;
                labelBtn.onclick = () => setPrompt(text);
                wrapper.appendChild(labelBtn);

                if (canDelete) {
                    const delBtn = document.createElement('button');
                    delBtn.className = "px-1.5 py-1 bg-slate-950/40 text-slate-500 hover:text-rose-400 hover:bg-slate-950 border-l border-slate-800 transition cursor-pointer";
                    delBtn.innerHTML = '<i class="fa-solid fa-xmark text-[9px]"></i>';
                    delBtn.onclick = (e) => {
                        e.stopPropagation();
                        removeSuggestion(text);
                    };
                    wrapper.appendChild(delBtn);
                }

                tray.appendChild(wrapper);
            }

            function saveCurrentAsSuggestion() {
                const query = document.getElementById('queryInput').value.trim();
                if (!query) return alert('Type something into the input field first before saving.');
                if (DEFAULT_SUGGESTIONS.includes(query)) return;
                
                const customs = getCustomSuggestions();
                if (customs.includes(query)) return;

                customs.push(query);
                localStorage.setItem('custom_car_prompts', JSON.stringify(customs));
                renderSuggestions();
            }

            function removeSuggestion(text) {
                let customs = getCustomSuggestions();
                customs = customs.filter(item => item !== text);
                localStorage.setItem('custom_car_prompts', JSON.stringify(customs));
                renderSuggestions();
            }

            function setPrompt(text) {
                document.getElementById('queryInput').value = text;
                searchCars();
            }

            async function triggerReset() {
                if (!confirm('Are you absolutely sure you want to clean up all DB records?')) return;
                const btn = document.getElementById('resetBtn');
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> <span>Wiping...</span>';
                try {
                    const res = await fetch('/api/reset');
                    const data = await res.json();
                    alert(data.message || 'Wiped successfully.');
                    searchCars(); 
                } catch(e) {
                    alert('Administrative reset route execution rejected.');
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> <span>Reset Slate</span>';
                }
            }

            async function triggerCrawl() {
                const btn = document.getElementById('crawlBtn');
                const originText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> <span>Syncing...</span>';
                try {
                    const res = await fetch('/api/crawl');
                    const data = await res.json();
                    alert(data.message);
                    searchCars(); 
                } catch(e) {
                    alert('Sync runtime execution failed.');
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = originText;
                }
            }

            async function searchCars() {
                const query = document.getElementById('queryInput').value.trim();
                const loader = document.getElementById('loader');
                const grid = document.getElementById('carGrid');
                const statusBox = document.getElementById('filterStatus');
                const searchBtn = document.getElementById('searchBtn');

                grid.innerHTML = '';
                statusBox.classList.add('hidden');
                loader.classList.remove('hidden');
                searchBtn.disabled = true;

                try {
                    const response = await fetch('/api/search?query=' + encodeURIComponent(query));
                    const data = await response.json();
                    loader.classList.add('hidden');
                    searchBtn.disabled = false;

                    if (!data.success) {
                        grid.innerHTML = '<div class="col-span-full text-center text-rose-400 p-8 border border-rose-950 bg-rose-950/20 rounded-xl"><p>' + data.error + '</p></div>';
                        return;
                    }

                    document.getElementById('aiFiltersText').innerText = JSON.stringify(data.ai_filters);
                    statusBox.classList.remove('hidden');

                    cachedCars = data.results || [];
                    displayCars();

                } catch(e) {
                    loader.classList.add('hidden');
                    searchBtn.disabled = false;
                    grid.innerHTML = '<div class="col-span-full text-center text-rose-400 p-8"><p>Interface API lookup exception occurred.</p></div>';
                }
            }

            function displayCars() {
                const grid = document.getElementById('carGrid');
                const hideSold = document.getElementById('hideSoldToggle').checked;
                
                grid.innerHTML = '';
                const filteredCars = hideSold ? cachedCars.filter(car => car.is_sold === 0) : cachedCars;
                document.getElementById('matchCount').innerText = filteredCars.length + ' vehicles rendering';

                if (filteredCars.length === 0) {
                    grid.innerHTML = '<div class="col-span-full text-center text-slate-500 py-16"><i class="fa-solid fa-car-tunnel text-4xl mb-3"></i><p class="text-lg font-medium">No matching cars currently in display views.</p></div>';
                    return;
                }

                filteredCars.forEach(car => {
                    const card = document.createElement('div');
                    const opacityStyle = car.is_sold ? "opacity-60 grayscale-[20%] hover:grayscale-0" : "";
                    card.className = "bg-slate-800 rounded-xl overflow-hidden border border-slate-700/60 shadow-lg hover:border-slate-600 transition flex flex-col justify-between " + opacityStyle;
                    
                    let badgesHTML = \`<span class="bg-slate-900 text-sky-400 border border-sky-950 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">\${car.brand}</span>\`;
                    if (car.is_hybrid) {
                        badgesHTML += \`<span class="bg-emerald-950/80 text-emerald-400 border border-emerald-900 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1"><i class="fa-solid fa-leaf"></i> Hybrid</span>\`;
                    }
                    if (car.original_price > 0) {
                        badgesHTML += \`<span class="bg-amber-950/80 text-amber-400 border border-amber-900 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1"><i class="fa-solid fa-tags"></i> 特價 SALE</span>\`;
                    }
                    if (car.is_sold) {
                        badgesHTML += \`<span class="bg-rose-950 text-rose-400 border border-rose-900 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1"><i class="fa-solid fa-handshake"></i> 已售 SOLD</span>\`;
                    }

                    const formattedCc = car.engine_cc > 0 ? car.engine_cc.toLocaleString() + ' c.c.' : 'N/A';
                    const formattedMileage = car.mileage > 0 ? car.mileage.toLocaleString() + ' km' : 'N/A';
                    const formattedOwners = car.previous_owners + '手';

                    let priceDisplayHTML = '';
                    if (car.original_price > 0) {
                        priceDisplayHTML = \`
                            <div class="flex flex-col mt-3">
                                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">特價 Special Price</span>
                                <div class="flex items-baseline space-x-2">
                                    <span class="text-2xl font-black text-orange-400 font-mono">HK$ \${car.price_hkd.toLocaleString()}</span>
                                    <span class="text-xs line-through text-slate-500 font-mono">HK$ \${car.original_price.toLocaleString()}</span>
                                </div>
                            </div>
                        \`;
                    } else {
                        priceDisplayHTML = \`
                            <div class="flex flex-col mt-3">
                                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">售價 Price</span>
                                <span class="text-2xl font-black text-amber-400 font-mono">HK$ \${car.price_hkd.toLocaleString()}</span>
                            </div>
                        \`;
                    }

                    card.innerHTML = \`
                        <div class="p-5">
                            <div class="flex flex-wrap gap-1.5 items-center justify-between mb-2">
                                <div class="flex flex-wrap gap-1.5">\${badgesHTML}</div>
                                <span class="text-[11px] font-bold bg-slate-950 text-amber-500 border border-slate-800 px-2 py-0.5 rounded-md">\${formattedOwners}</span>
                            </div>
                            <h3 class="text-lg font-bold text-white truncate mb-1">\${car.model}</h3>
                            
                            <div class="grid grid-cols-3 gap-2 my-3 text-center border-y border-slate-700/40 py-2 text-[11px] font-medium text-slate-400">
                                <div class="border-r border-slate-700/30">
                                    <div class="text-[10px] uppercase tracking-wide text-slate-500 mb-0.5"><i class="fa-solid fa-calendar text-sky-500/80"></i> Year</div>
                                    <span class="text-slate-200 font-semibold">\${car.year}</span>
                                </div>
                                <div class="border-r border-slate-700/30">
                                    <div class="text-[10px] uppercase tracking-wide text-slate-500 mb-0.5"><i class="fa-solid fa-gauge-high text-sky-500/80"></i> Mileage</div>
                                    <span class="text-slate-200 font-semibold truncate block px-0.5">\${formattedMileage}</span>
                                </div>
                                <div>
                                    <div class="text-[10px] uppercase tracking-wide text-slate-500 mb-0.5"><i class="fa-solid fa-bolt text-sky-500/80"></i> Engine</div>
                                    <span class="text-slate-200 font-semibold">\${formattedCc}</span>
                                </div>
                            </div>

                            \${priceDisplayHTML}
                        </div>
                        <div class="bg-slate-800/50 px-5 py-3 border-t border-slate-700/40">
                            <a href="\${car.url}" target="_blank" class="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center justify-between group">
                                <span>View Listing Details on DCH UCC</span>
                                <i class="fa-solid fa-arrow-up-right-from-square group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"></i>
                            </a>
                        </div>
                    \`;
                    grid.appendChild(card);
                });
            }
            
            window.onload = () => { 
                renderSuggestions();
                searchCars(); 
            };
        </script>
    </body>
    </html>
    `;

    return new Response(htmlUI, { headers: { "Content-Type": "text/html" } });
  }
};