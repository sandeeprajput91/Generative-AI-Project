// Automatically use the Python backend when running locally (file:// or localhost/127.0.0.1 outside of AI Studio port 3000)
const isLocalEnv = window.location.protocol === 'file:' || 
                   ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000');
const BACKEND_URL = isLocalEnv ? 'http://127.0.0.1:8000' : '';

let currentMode = 'qa';
let currentOutputRaw = '';

// The configuration for all modules
const uiConfig = {
    qa: {
        title: "Q&A Search", icon: "fa-comments",
        html: `
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Q&A Subject</label>
            <input type="text" id="mainInput" class="w-full p-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm bg-slate-50 border-slate-200 placeholder-slate-400 text-slate-900 dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder-zinc-600 dark:text-zinc-100 mt-4 mb-2" placeholder="E.g., What is quantum entanglement?">
            <button onclick="handleSend()" class="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Get Answer
            </button>`
    },
    explainer: {
        title: "Concept Explainer", icon: "fa-lightbulb",
        html: `
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Concept Subject</label>
            <input type="text" id="mainInput" class="w-full p-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm bg-slate-50 border-slate-200 placeholder-slate-400 text-slate-900 dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder-zinc-600 dark:text-zinc-100 mt-4 mb-2" placeholder="E.g., Photosynthesis">
            <button onclick="handleSend()" class="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Explain Concept
            </button>`
    },
    summary: {
        title: "Text Summarizer", icon: "fa-align-left",
        html: `
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Text Subject</label>
            <textarea id="mainInput" class="w-full p-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-h-[160px] resize-y text-sm bg-slate-50 border-slate-200 placeholder-slate-400 text-slate-900 dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder-zinc-600 dark:text-zinc-100 mt-4 mb-2" placeholder="Paste your essay, article, or notes here..."></textarea>
            <button onclick="handleSend()" class="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Summarize
            </button>`
    },
    roadmap: {
        title: "Roadmap Planner", icon: "fa-map",
        html: `
            <div class="flex flex-col md:flex-row gap-4 mt-4 mb-2">
                <div class="flex-1">
                    <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Roadmap Subject</label>
                    <input type="text" id="mainInput" class="w-full p-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm bg-slate-50 border-slate-200 placeholder-slate-400 text-slate-900 dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder-zinc-600 dark:text-zinc-100 mt-2" placeholder="E.g., Python Programming">
                </div>
                <div class="md:w-1/3">
                    <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Level</label>
                    <div class="relative mt-2">
                        <select id="levelSelect" class="w-full p-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm bg-slate-50 border-slate-200 text-slate-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 appearance-none cursor-pointer">
                            <option value="Basic">Basic</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                        <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none"></i>
                    </div>
                </div>
            </div>
            <button onclick="handleSend()" class="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Create Roadmap
            </button>`
    },
    test_quiz: {
        title: "Test Quiz", icon: "fa-spell-check",
        html: `
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Test Quiz Subject</label>
            <input type="text" id="mainInput" class="w-full p-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm bg-slate-50 border-slate-200 placeholder-slate-400 text-slate-900 dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder-zinc-600 dark:text-zinc-100 mt-4 mb-2" placeholder="E.g., World War II">
            <button onclick="handleSend()" class="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Test Quiz
            </button>`
    },
    flashcards: {
        title: "Flashcards", icon: "fa-layer-group",
        html: `
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Flashcards Subject</label>
            <input type="text" id="mainInput" class="w-full p-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm bg-slate-50 border-slate-200 placeholder-slate-400 text-slate-900 dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder-zinc-600 dark:text-zinc-100 mt-4 mb-2" placeholder="E.g., Biology: Cell Structure">
            <button onclick="handleSend()" class="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Flashcards
            </button>`
    },
    timetable: {
        title: "Timetable Builder", icon: "fa-calendar-days",
        html: `
            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Your Goals & Availability</label>
            <textarea id="mainInput" class="w-full p-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-h-[160px] resize-y text-sm bg-slate-50 border-slate-200 placeholder-slate-400 text-slate-900 dark:bg-zinc-900 dark:border-zinc-800 dark:placeholder-zinc-600 dark:text-zinc-100 mt-4 mb-2" placeholder="E.g., I want to study machine learning for 2 hours every evening..."></textarea>
            <button onclick="handleSend()" class="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Build Timetable
            </button>`
    }
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    renderForm('qa');

    // Sidebar Interactions
    const menuBtns = document.querySelectorAll('.menu-btn');
    menuBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            currentMode = mode;
            menuBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            renderForm(mode);
            closeMobileSidebar();
        });
    });

    // Mobile Sidebar
    document.getElementById('openSidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('-translate-x-full');
        document.getElementById('sidebarOverlay').classList.remove('hidden');
    });
    
    const closeMobileSidebar = () => {
        document.getElementById('sidebar').classList.add('-translate-x-full');
        document.getElementById('sidebarOverlay').classList.add('hidden');
    };

    document.getElementById('closeSidebar').addEventListener('click', closeMobileSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', closeMobileSidebar);

    // Theme Toggle
    const themeToggleLight = document.getElementById('themeToggleLight');
    const themeToggleDark = document.getElementById('themeToggleDark');

    const updateThemeButtons = (isDark) => {
        if (isDark) {
            themeToggleDark.classList.remove('bg-transparent', 'shadow-none', 'text-zinc-500');
            themeToggleDark.classList.add('bg-zinc-800', 'text-white', 'shadow-lg');
            themeToggleLight.classList.remove('bg-white', 'shadow-sm', 'text-slate-500');
            themeToggleLight.classList.add('bg-transparent', 'shadow-none', 'text-zinc-500');
        } else {
            themeToggleLight.classList.remove('bg-transparent', 'shadow-none', 'text-zinc-500');
            themeToggleLight.classList.add('bg-white', 'shadow-sm', 'text-slate-500');
            themeToggleDark.classList.remove('bg-zinc-800', 'text-white', 'shadow-lg');
            themeToggleDark.classList.add('bg-transparent', 'shadow-none', 'text-slate-500');
        }
    };

    themeToggleLight.addEventListener('click', () => {
        document.documentElement.classList.remove('dark');
        updateThemeButtons(false);
    });

    themeToggleDark.addEventListener('click', () => {
        document.documentElement.classList.add('dark');
        updateThemeButtons(true);
    });

    // Initialize buttons
    updateThemeButtons(document.documentElement.classList.contains('dark'));
});

function renderForm(mode) {
    const config = uiConfig[mode];
    document.getElementById('module-title').innerText = config.title;
    document.getElementById('module-icon').className = `fa-solid ${config.icon}`;
    document.getElementById('dynamic-inputs').innerHTML = config.html;
    
    // Add enter key support for inputs and auto-resize for textareas
    const input = document.getElementById('mainInput');
    if (input.tagName === 'INPUT') {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    } else if (input.tagName === 'TEXTAREA') {
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
}

async function handleSend() {
    const inputEl = document.getElementById('mainInput');
    const query = inputEl.value.trim();
    if (!query) return;

    let level = "Beginner";
    const levelSelect = document.getElementById('levelSelect');
    if (levelSelect) {
        level = levelSelect.value;
    }

    const chatContainer = document.getElementById('chatContainer');
    
    // Clear placeholder if it exists
    if (chatContainer.querySelector('.fa-brain')) {
        chatContainer.innerHTML = '';
        chatContainer.classList.add('overflow-y-auto', 'custom-scrollbar', 'p-6', 'space-y-8');
        chatContainer.classList.remove('relative');
    }

    const interactionId = Date.now();
    const historyItem = document.createElement('div');
    historyItem.className = "flex flex-col gap-4 border-b border-slate-100 dark:border-zinc-800 pb-8 last:border-0 relative group interaction-item";
    historyItem.id = `interaction-${interactionId}`;
    historyItem.innerHTML = `
        <div class="self-end bg-indigo-50 dark:bg-indigo-500/10 text-slate-800 dark:text-zinc-200 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm border border-indigo-100 dark:border-indigo-500/20 mt-4 md:mx-4">
            <span class="text-[10px] font-bold uppercase opacity-50 block mb-1 text-indigo-600 dark:text-indigo-400"><i class="fa-solid ${uiConfig[currentMode].icon} mr-1"></i> ${uiConfig[currentMode].title}</span>
            <p class="text-sm font-medium whitespace-pre-wrap">${query}</p>
        </div>
        <div id="loading-${interactionId}" class="self-start flex items-center justify-center p-4 text-zinc-500 w-full">
            <div class="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mr-3"></div>
            <p class="font-medium text-xs text-indigo-500 animate-pulse">Generating...</p>
        </div>
        <div id="output-wrapper-${interactionId}" class="self-start w-full hidden relative">
            <div class="flex justify-end gap-2 mb-2 mr-4 md:mr-8 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 -top-8 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-1 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-sm">
                <button onclick="copyInteraction('${interactionId}')" class="p-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 rounded-md transition-colors" title="Copy to clipboard"><i class="fa-solid fa-copy" id="copy-icon-${interactionId}"></i></button>
                <button onclick="downloadInteraction('${interactionId}', '${currentMode}')" class="p-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 rounded-md transition-colors" title="Export as TXT"><i class="fa-solid fa-download"></i></button>
                <button onclick="deleteInteraction(this)" class="p-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 rounded-md transition-colors" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
            <div id="output-${interactionId}"></div>
        </div>
    `;
    
    if (chatContainer.firstChild) {
        chatContainer.insertBefore(historyItem, chatContainer.firstChild);
    } else {
        chatContainer.appendChild(historyItem);
    }
    
    // scroll to top smoothly
    setTimeout(() => {
        chatContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);

    inputEl.value = '';

    try {
        const response = await fetch(`${BACKEND_URL}/${currentMode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, level: level })
        });
        const data = await response.json();
        
        document.getElementById(`loading-${interactionId}`).classList.add('hidden');
        const outputWrapper = document.getElementById(`output-wrapper-${interactionId}`);
        outputWrapper.classList.remove('hidden');
        const outputContainer = document.getElementById(`output-${interactionId}`);
        
        if (!response.ok) {
            throw new Error(data.answer || data.error || 'Server error');
        }
        
        window.interactionData = window.interactionData || {};
        window.interactionData[interactionId] = data.answer;
        
        if (currentMode === 'flashcards') {
            try {
                const flashData = typeof data.answer === 'string' ? JSON.parse(data.answer) : data.answer;
                renderFlashcards(flashData, outputContainer);
            } catch (e) {
                console.error("Failed to parse flashcards JSON", e);
                renderTabs(data.answer, outputContainer);
            }
        } else if (currentMode === 'test_quiz') {
            try {
                const quizData = typeof data.answer === 'string' ? JSON.parse(data.answer) : data.answer;
                renderInteractiveQuiz(quizData, outputContainer);
            } catch (e) {
                console.error("Failed to parse test_quiz JSON", e);
                renderTabs(data.answer, outputContainer);
            }
        } else {
            renderTabs(data.answer, outputContainer);
        }
        
        setTimeout(() => {
            chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
        }, 100);
        
    } catch (e) {
        document.getElementById(`loading-${interactionId}`).classList.add('hidden');
        const outputContainer = document.getElementById(`output-${interactionId}`);
        outputContainer.classList.remove('hidden');
        outputContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center p-6 text-red-500 bg-red-50 dark:bg-red-500/10 rounded-2xl">
                <i class="fa-solid fa-triangle-exclamation text-3xl mb-3 opacity-80"></i>
                <p class="font-bold">Error generating content</p>
                <p class="text-sm mt-1 opacity-80">${e.message}</p>
            </div>
        `;
        setTimeout(() => {
            chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
        }, 100);
    }
}

// Automatically splits the ### AI text into interactive tabs
function renderTabs(text, container) {
    if (text.includes("###")) {
        const sections = text.split(/###\s+/).filter(s => s.trim() !== "");
        
        let htmlContent = `
            <div class="flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]/50 mx-4 md:mx-8 sm:m-0">
                <div class="flex overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#121214]">
        `;
        
        sections.forEach((sec, index) => {
            const title = sec.split('\n')[0].trim().replace(/\*/g, '');
            const activeClass = index === 0 
                ? 'border-indigo-600 text-indigo-600 bg-white dark:border-indigo-500 dark:text-indigo-400 dark:bg-zinc-900/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/30';
            
            htmlContent += `
                <button class="tab-btn whitespace-nowrap px-6 py-4 text-sm font-semibold transition-all border-b-2 ${activeClass}" 
                        onclick="switchTab(event, 'tab-${index}')">${title}</button>
            `;
        });
        
        htmlContent += `</div><div class="p-6 sm:p-8">`; 
        
        sections.forEach((sec, index) => {
            const body = sec.split('\n').slice(1).join('\n');
            // Parse markdown
            const parsedBody = marked.parse(body);
            const display = index === 0 ? 'block' : 'none';
            htmlContent += `<div id="tab-${index}" class="tab-content markdown-body" style="display: ${display};">${parsedBody}</div>`;
        });
        
        htmlContent += `</div></div>`;
        container.innerHTML = htmlContent;
    } else {
        const parsedBody = marked.parse(text);
        container.innerHTML = `
            <div class="p-6 sm:p-8 mx-4 md:mx-8">
                <div class="markdown-body">${parsedBody}</div>
            </div>
        `;
    }
}

window.clearWorkspace = function() {
    currentOutputRaw = '';
    const container = document.getElementById('chatContainer');
    container.classList.remove('overflow-y-auto', 'custom-scrollbar', 'p-6', 'space-y-8');
    container.classList.add('relative');
    container.innerHTML = `
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-zinc-900/30">
            <div class="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30 shadow-inner">
                <i class="fa-solid fa-brain text-4xl text-indigo-400 dark:text-indigo-500"></i>
            </div>
            <p class="font-bold text-slate-700 dark:text-zinc-300 text-lg">Select a module to begin</p>
            <p class="text-sm mt-2 max-w-sm text-slate-500 dark:text-zinc-500">Transform your learning experience with AI-powered study materials.</p>
            <div class="mt-8 grid grid-cols-2 gap-3 w-full max-w-sm">
                <button class="p-3 text-xs font-semibold text-left border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors dark:text-zinc-400" onclick="document.querySelector('[data-mode=\\'qa\\']').click()"><i class="fa-solid fa-comments text-indigo-400 mr-2"></i> Ask a Question</button>
                <button class="p-3 text-xs font-semibold text-left border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors dark:text-zinc-400" onclick="document.querySelector('[data-mode=\\'summary\\']').click()"><i class="fa-solid fa-align-left text-emerald-400 mr-2"></i> Summarize Text</button>
                <button class="p-3 text-xs font-semibold text-left border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors dark:text-zinc-400" onclick="document.querySelector('[data-mode=\\'roadmap\\']').click()"><i class="fa-solid fa-map text-amber-400 mr-2"></i> Build Roadmap</button>
                <button class="p-3 text-xs font-semibold text-left border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors dark:text-zinc-400" onclick="document.querySelector('[data-mode=\\'test_quiz\\']').click()"><i class="fa-solid fa-spell-check text-rose-400 mr-2"></i> Test Quiz</button>
                <button class="p-3 text-xs font-semibold text-left border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors dark:text-zinc-400" onclick="document.querySelector('[data-mode=\\'flashcards\\']').click()"><i class="fa-solid fa-layer-group text-purple-400 mr-2"></i> Flashcards</button>
            </div>
        </div>
    `;
    const inputEl = document.getElementById('mainInput');
    if (inputEl) {
        inputEl.value = '';
        if (inputEl.tagName === 'TEXTAREA') {
            inputEl.style.height = 'auto';
        }
    }
};

function formatExportData(data, mode) {
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            return data;
        }
    }
    
    if (mode === 'flashcards' && data.cards) {
        let text = `${data.title || 'Flashcards'}\n\n`;
        data.cards.forEach((card, index) => {
            text += `--- Card ${index + 1} ---\nQ: ${card.front}\nA: ${card.back}\n\n`;
        });
        return text.trim();
    }
    
    if (mode === 'test_quiz' && data.questions) {
        let text = `${data.title || 'Test Quiz'}\n\n`;
        data.questions.forEach((q, index) => {
            text += `--- Question ${index + 1} ---\n${q.question}\n\n`;
            q.options.forEach((opt, oIdx) => {
                const letter = String.fromCharCode(65 + oIdx);
                text += `${letter}) ${opt}\n`;
            });
            const correctLetter = String.fromCharCode(65 + q.correct_index);
            text += `\nCorrect Answer: ${correctLetter}\n`;
            text += `Explanation: ${q.explanation}\n\n`;
        });
        return text.trim();
    }
    
    return typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
}

window.copyInteraction = function(id) {
    const data = window.interactionData && window.interactionData[id];
    if (!data) return;
    // We can infer mode if we store it, but let's see if we can just guess from data shape
    let mode = 'summary';
    if (typeof data === 'string') {
        try {
            const parsed = JSON.parse(data);
            if (parsed.cards) mode = 'flashcards';
            if (parsed.questions) mode = 'test_quiz';
        } catch(e) {}
    } else {
        if (data.cards) mode = 'flashcards';
        if (data.questions) mode = 'test_quiz';
    }
    
    const textToCopy = formatExportData(data, mode);
    navigator.clipboard.writeText(textToCopy).then(() => {
        const icon = document.getElementById(`copy-icon-${id}`);
        if (icon) {
            icon.classList.remove('fa-copy');
            icon.classList.add('fa-check', 'text-emerald-500');
            setTimeout(() => {
                icon.classList.add('fa-copy');
                icon.classList.remove('fa-check', 'text-emerald-500');
            }, 2000);
        }
    }).catch(err => {
        console.error("Could not copy text: ", err);
    });
};

window.downloadInteraction = function(id, mode) {
    const data = window.interactionData && window.interactionData[id];
    if (!data) return;
    const textToDownload = formatExportData(data, mode);
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduGenie_${mode}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.deleteInteraction = function(btn) {
    const item = btn.closest('.interaction-item');
    if (item) item.remove();
    
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer && chatContainer.children.length === 0) {
        window.clearWorkspace();
    }
};

window.switchTab = function(event, tabId) {
    const container = event.target.closest('.flex-col');
    
    // Reset buttons
    container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = 'tab-btn whitespace-nowrap px-6 py-4 text-sm font-semibold transition-all border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/30';
    });
    
    // Activate button
    event.target.className = 'tab-btn whitespace-nowrap px-6 py-4 text-sm font-semibold transition-all border-b-2 border-indigo-600 text-indigo-600 bg-white dark:border-indigo-500 dark:text-indigo-400 dark:bg-zinc-900/50';
    
    // Hide all content
    container.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show target content
    container.querySelector('#' + tabId).style.display = 'block';
};

// Interactive Quiz Logic
let currentQuizData = null;
let userAnswers = [];

window.renderInteractiveQuiz = function(quizData, container) {
    currentQuizData = quizData;
    userAnswers = new Array(quizData.questions.length).fill(null);
    
    let html = `
        <div class="flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]/50 mx-4 md:mx-8 sm:m-0 p-6 sm:p-8">
            <h2 class="text-2xl font-bold font-serif mb-6 text-slate-900 dark:text-zinc-100">${quizData.title || 'Knowledge Check'}</h2>
            <div id="quiz-questions" class="space-y-8">
    `;
    
    quizData.questions.forEach((q, qIndex) => {
        html += `
            <div class="quiz-question-card bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                <p class="font-semibold text-lg mb-4 text-slate-800 dark:text-zinc-200"><span class="text-indigo-600 dark:text-indigo-400 mr-2">${qIndex + 1}.</span> ${q.question}</p>
                <div class="space-y-3">
        `;
        
        q.options.forEach((opt, oIndex) => {
            html += `
                <button onclick="selectQuizOption(${qIndex}, ${oIndex})" id="btn-q${qIndex}-o${oIndex}" class="quiz-option w-full text-left p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
                    <div class="flex items-center gap-3">
                        <div class="w-6 h-6 rounded-full border border-slate-300 dark:border-zinc-600 flex items-center justify-center shrink-0" id="circle-q${qIndex}-o${oIndex}"></div>
                        <span class="text-slate-700 dark:text-zinc-300">${opt}</span>
                    </div>
                </button>
            `;
        });
        
        html += `
                </div>
                <div id="explanation-${qIndex}" class="hidden mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-sm text-indigo-900 dark:text-indigo-200">
                    <span class="font-bold uppercase tracking-wider text-xs mb-1 block">Explanation</span>
                    ${q.explanation}
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            <div class="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                <div id="quiz-score" class="font-bold text-lg hidden"></div>
                <button onclick="submitQuiz()" id="submit-quiz-btn" class="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20 ml-auto">
                    Evaluate
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
};

window.selectQuizOption = function(qIndex, oIndex) {
    if (document.getElementById('submit-quiz-btn').style.display === 'none') return;
    
    userAnswers[qIndex] = oIndex;
    
    for(let i=0; i<currentQuizData.questions[qIndex].options.length; i++) {
        const btn = document.getElementById(`btn-q${qIndex}-o${i}`);
        const circle = document.getElementById(`circle-q${qIndex}-o${i}`);
        
        btn.className = "quiz-option w-full text-left p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all";
        circle.innerHTML = "";
        circle.className = "w-6 h-6 rounded-full border border-slate-300 dark:border-zinc-600 flex items-center justify-center shrink-0";
    }
    
    const selectedBtn = document.getElementById(`btn-q${qIndex}-o${oIndex}`);
    const selectedCircle = document.getElementById(`circle-q${qIndex}-o${oIndex}`);
    
    selectedBtn.className = "quiz-option w-full text-left p-4 rounded-xl border-2 border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 transition-all";
    selectedCircle.className = "w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 border-none flex items-center justify-center shrink-0";
    selectedCircle.innerHTML = `<i class="fa-solid fa-circle text-[8px] text-white"></i>`;
};

window.submitQuiz = function() {
    if (userAnswers.includes(null)) {
        alert("Please answer all questions before evaluating.");
        return;
    }

    document.getElementById('submit-quiz-btn').style.display = 'none';
    let score = 0;
    
    currentQuizData.questions.forEach((q, qIndex) => {
        const correctIndex = q.correct_index;
        const userIndex = userAnswers[qIndex];
        
        for(let i=0; i<q.options.length; i++) {
            const btn = document.getElementById(`btn-q${qIndex}-o${i}`);
            btn.style.cursor = 'default';
            
            if (i === correctIndex) {
                btn.className = "quiz-option w-full text-left p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 transition-all";
                const circle = document.getElementById(`circle-q${qIndex}-o${i}`);
                circle.className = "w-6 h-6 rounded-full bg-emerald-500 border-none flex items-center justify-center shrink-0";
                circle.innerHTML = `<i class="fa-solid fa-check text-white text-xs"></i>`;
            } else if (i === userIndex && userIndex !== correctIndex) {
                btn.className = "quiz-option w-full text-left p-4 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-500/10 transition-all";
                const circle = document.getElementById(`circle-q${qIndex}-o${i}`);
                circle.className = "w-6 h-6 rounded-full bg-red-500 border-none flex items-center justify-center shrink-0";
                circle.innerHTML = `<i class="fa-solid fa-xmark text-white text-xs"></i>`;
            } else {
                btn.className = "quiz-option w-full text-left p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 opacity-50 transition-all";
            }
        }
        
        document.getElementById(`explanation-${qIndex}`).classList.remove('hidden');
        
        if (userIndex === correctIndex) {
            score++;
        }
    });
    
    const scoreDiv = document.getElementById('quiz-score');
    scoreDiv.classList.remove('hidden');
    scoreDiv.innerHTML = `Your Score: <span class="text-indigo-600 dark:text-indigo-400">${score}/${currentQuizData.questions.length}</span>`;
};

// Flashcards Logic
window.renderFlashcards = function(flashData, container) {
    let html = `
        <div class="flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]/50 mx-4 md:mx-8 sm:m-0 p-6 sm:p-8">
            <h2 class="text-2xl font-bold font-serif mb-6 text-slate-900 dark:text-zinc-100">${flashData.title || 'Flashcards'}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    `;
    
    flashData.cards.forEach((card, index) => {
        html += `
            <div class="relative w-full h-[280px] perspective-1000 group cursor-pointer hover:-translate-y-1 transition-transform duration-300" onclick="this.querySelector('.flashcard-inner').classList.toggle('[transform:rotateY(180deg)]')">
                <div class="flashcard-inner relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]">
                    <!-- Front -->
                    <div class="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/30 dark:to-[#15132b] border-2 border-indigo-100 dark:border-indigo-500/20 rounded-2xl flex flex-col shadow-sm group-hover:shadow-md transition-shadow">
                        <div class="flex-none p-4 pb-0 flex justify-between items-center">
                            <span class="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 tracking-widest bg-indigo-100/50 dark:bg-indigo-500/20 px-2 py-1 rounded-md">CARD ${index + 1}</span>
                            <div class="w-6 h-6 rounded-full bg-indigo-100/50 dark:bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/40 transition-colors">
                                <i class="fa-solid fa-arrows-rotate text-xs text-indigo-500 dark:text-indigo-400"></i>
                            </div>
                        </div>
                        <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar flex items-center justify-center">
                            <h3 class="text-base md:text-lg font-bold text-indigo-900 dark:text-indigo-100 text-center leading-relaxed m-auto">${card.front}</h3>
                        </div>
                        <div class="flex-none p-3 text-center border-t border-indigo-100/50 dark:border-indigo-500/20">
                            <span class="text-xs font-medium text-indigo-400 dark:text-indigo-500 opacity-80 uppercase tracking-widest">Click to flip</span>
                        </div>
                    </div>
                    <!-- Back -->
                    <div class="absolute inset-0 backface-hidden [transform:rotateY(180deg)] bg-gradient-to-br from-white to-slate-50 dark:from-zinc-800 dark:to-zinc-900/50 border-2 border-slate-200 dark:border-zinc-700 rounded-2xl flex flex-col shadow-sm group-hover:shadow-md transition-shadow">
                        <div class="flex-none p-4 pb-0 flex justify-between items-center">
                            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-widest bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-md">ANSWER</span>
                        </div>
                        <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                            <p class="text-sm md:text-[15px] text-slate-700 dark:text-zinc-300 font-medium text-left leading-relaxed">${card.back}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        <style>
            .perspective-1000 { perspective: 1000px; }
            .backface-hidden { backface-visibility: hidden; }
        </style>
    `;
    
    container.innerHTML = html;
};
