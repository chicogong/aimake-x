// 初始化 Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
        primaryColor: '#0066FF',
        primaryTextColor: '#F9FAFB',
        primaryBorderColor: '#0066FF',
        lineColor: '#3385FF',
        secondaryColor: '#00D9FF',
        tertiaryColor: '#111827'
    }
});

// 自动检测 API 地址：本地开发用 localhost，生产环境用自定义域名
const API_BASE = window.location.hostname === 'localhost' || window.location.protocol === 'file:'
    ? 'http://localhost:8788'
    : 'https://x.aimake.cc';
const caseIcons = { 'gov-doc': '📄', 'invoice': '🧾', 'video': '🎬', 'meeting': '🎙️', 'contract': '📋' };

// Turnstile token 管理
let turnstileToken = null;

function onTurnstileSuccess(token) {
    turnstileToken = token;
    console.log('Turnstile 验证成功');
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // 收藏按钮
    const heartBtn = document.createElement('button');
    heartBtn.className = `favorite-btn ${isFavorite(product.url) ? 'active' : ''}`;
    heartBtn.innerHTML = '❤';
    heartBtn.title = '收藏';
    heartBtn.onclick = (e) => {
        e.stopPropagation();
        toggleFavorite({ id: product.url, type: 'tool', data: product });
        heartBtn.classList.toggle('active');
    };
    card.appendChild(heartBtn);

    const icon = document.createElement('div');
    icon.className = 'product-icon';
    icon.textContent = product.name.charAt(0).toUpperCase();

    const badge = document.createElement('span');
    badge.className = 'product-badge';
    badge.textContent = '推荐';

    const header = document.createElement('div');
    header.className = 'product-header';
    header.appendChild(icon);
    header.appendChild(badge);

    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = product.name;

    const desc = document.createElement('p');
    desc.className = 'product-desc';
    desc.textContent = product.desc;

    const url = document.createElement('span');
    url.className = 'product-url';
    try { url.textContent = new URL(product.url).hostname; } catch { url.textContent = product.url; }

    const link = document.createElement('a');
    link.className = 'product-link';
    link.href = product.url;
    link.target = '_blank';
    link.textContent = '立即使用 →';
    link.onclick = (e) => e.stopPropagation();

    const footer = document.createElement('div');
    footer.className = 'product-footer';
    footer.appendChild(url);
    footer.appendChild(link);

    card.appendChild(header);
    card.appendChild(name);
    card.appendChild(desc);
    card.appendChild(footer);
    return card;
}

function createCaseCard(c) {
    const card = document.createElement('div');
    card.className = 'case-card';
    card.onclick = () => { document.getElementById('searchInput').value = c.title; search(); };

    const icon = document.createElement('div');
    icon.className = 'case-icon';
    icon.textContent = caseIcons[c.id] || '📌';

    const title = document.createElement('h3');
    title.className = 'case-title';
    title.textContent = c.title;

    const pain = document.createElement('p');
    pain.className = 'case-pain';
    pain.textContent = c.desc;

    const solution = document.createElement('div');
    solution.className = 'case-solution';
    solution.textContent = '✓ ' + c.solution;

    const products = document.createElement('div');
    products.className = 'case-products';
    c.products.forEach(p => {
        const tag = document.createElement('span');
        tag.className = 'case-product-tag';
        tag.textContent = p;
        products.appendChild(tag);
    });

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(pain);
    card.appendChild(solution);
    card.appendChild(products);
    return card;
}

// 创建 SVG 元素 (安全方式)
function createSVG(pathData, size = 20) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);

    return svg;
}

// 创建工作流步骤卡片
function createStepCard(step) {
    const card = document.createElement('div');
    card.className = 'step-card';

    // 步骤头部
    const header = document.createElement('div');
    header.className = 'step-header';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'step-header-left';

    const number = document.createElement('div');
    number.className = 'step-number';
    number.textContent = step.step;

    const title = document.createElement('div');
    title.className = 'step-title';
    title.textContent = step.name;

    headerLeft.appendChild(number);
    headerLeft.appendChild(title);

    const icon = document.createElement('div');
    icon.className = 'expand-icon';
    icon.appendChild(createSVG('M6 9l6 6 6-6'));

    header.appendChild(headerLeft);
    header.appendChild(icon);

    // 步骤内容
    const content = document.createElement('div');
    content.className = 'step-content';

    // 描述
    if (step.description) {
        const desc = document.createElement('p');
        desc.className = 'step-description';
        desc.textContent = step.description;
        content.appendChild(desc);
    }

    // 工具推荐
    if (step.tools && step.tools.length > 0) {
        const toolsSection = document.createElement('div');
        toolsSection.className = 'tools-section';

        const toolsTitle = document.createElement('div');
        toolsTitle.className = 'section-title';
        toolsTitle.textContent = '🔧 推荐工具';
        toolsSection.appendChild(toolsTitle);

        step.tools.forEach(tool => {
            const toolItem = document.createElement('div');
            toolItem.className = 'tool-item';
            toolItem.onclick = () => window.open(tool.url, '_blank');

            const toolIcon = document.createElement('div');
            toolIcon.className = 'tool-icon';
            toolIcon.textContent = tool.name.charAt(0).toUpperCase();

            const toolInfo = document.createElement('div');
            toolInfo.className = 'tool-info';

            const toolName = document.createElement('div');
            toolName.className = 'tool-name';
            toolName.textContent = tool.name;

            const toolReason = document.createElement('div');
            toolReason.className = 'tool-reason';
            toolReason.textContent = tool.reason;

            toolInfo.appendChild(toolName);
            toolInfo.appendChild(toolReason);
            toolItem.appendChild(toolIcon);
            toolItem.appendChild(toolInfo);
            toolsSection.appendChild(toolItem);
        });

        content.appendChild(toolsSection);
    }

    // Prompt模板
    if (step.prompt) {
        const promptSection = document.createElement('div');
        promptSection.className = 'prompt-section';

        const promptTitle = document.createElement('div');
        promptTitle.className = 'section-title';
        promptTitle.textContent = '💡 Prompt 模板';
        promptSection.appendChild(promptTitle);

        // 模板
        const templateBox = document.createElement('div');
        templateBox.className = 'prompt-box';

        const templateLabel = document.createElement('div');
        templateLabel.className = 'prompt-label';
        templateLabel.textContent = '模板';

        const templateText = document.createElement('div');
        templateText.className = 'prompt-text';
        templateText.textContent = step.prompt.template;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = '复制';
        copyBtn.onclick = () => copyToClipboard(step.prompt.template, copyBtn);

        templateBox.appendChild(templateLabel);
        templateBox.appendChild(templateText);
        templateBox.appendChild(copyBtn);
        promptSection.appendChild(templateBox);

        // 示例
        if (step.prompt.example) {
            const exampleBox = document.createElement('div');
            exampleBox.className = 'prompt-box';

            const exampleLabel = document.createElement('div');
            exampleLabel.className = 'prompt-label';
            exampleLabel.textContent = '示例';

            const exampleText = document.createElement('div');
            exampleText.className = 'prompt-text';
            exampleText.textContent = step.prompt.example;

            const copyBtn2 = document.createElement('button');
            copyBtn2.className = 'copy-btn';
            copyBtn2.textContent = '复制';
            copyBtn2.onclick = () => copyToClipboard(step.prompt.example, copyBtn2);

            exampleBox.appendChild(exampleLabel);
            exampleBox.appendChild(exampleText);
            exampleBox.appendChild(copyBtn2);
            promptSection.appendChild(exampleBox);
        }

        content.appendChild(promptSection);
    }

    // 操作提示
    if (step.tips && step.tips.length > 0) {
        const tipsSection = document.createElement('div');
        tipsSection.className = 'tips-section';

        const tipsTitle = document.createElement('div');
        tipsTitle.className = 'section-title';
        tipsTitle.textContent = '💭 操作提示';
        tipsSection.appendChild(tipsTitle);

        step.tips.forEach(tip => {
            const tipItem = document.createElement('div');
            tipItem.className = 'tip-item';

            const tipText = document.createElement('div');
            tipText.className = 'tip-text';
            tipText.textContent = tip;

            tipItem.appendChild(tipText);
            tipsSection.appendChild(tipItem);
        });

        content.appendChild(tipsSection);
    }

    card.appendChild(header);
    card.appendChild(content);

    // 点击展开/收起
    header.onclick = () => card.classList.toggle('expanded');

    return card;
}

// 复制到剪贴板
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    });
}

// 渲染工作流
async function renderWorkflow(data) {
    const grid = document.getElementById('resultsGrid');
    grid.replaceChildren();

    const container = document.createElement('div');
    container.className = 'workflow-container';

    // 工作流头部
    const header = document.createElement('div');
    header.className = 'workflow-header';

    const title = document.createElement('h2');
    title.className = 'workflow-title';
    title.textContent = data.task || '工作流程';

    // 元信息
    const meta = document.createElement('div');
    meta.className = 'workflow-meta';

    if (data.complexity) {
        const complexityMap = {
            'simple': '简单',
            'moderate': '中等',
            'complex': '复杂'
        };
        const badge1 = document.createElement('span');
        badge1.className = 'meta-badge';
        badge1.textContent = `📊 复杂度: ${complexityMap[data.complexity] || data.complexity}`;
        meta.appendChild(badge1);
    }

    if (data.estimatedTime) {
        const badge2 = document.createElement('span');
        badge2.className = 'meta-badge';
        badge2.textContent = `⏱️ 预估时间: ${data.estimatedTime}`;
        meta.appendChild(badge2);
    }

    if (data.source) {
        const badge3 = document.createElement('span');
        badge3.className = 'source-badge';
        badge3.textContent = `${data.source === 'template' ? '📚 场景模板' : '🤖 AI生成'}`;
        meta.appendChild(badge3);
    }

    header.appendChild(title);
    header.appendChild(meta);

    // 流程图
    if (data.mermaid) {
        const flowchartContainer = document.createElement('div');
        flowchartContainer.className = 'flowchart-container';
        const flowchartDiv = document.createElement('div');
        flowchartDiv.id = 'mermaid-' + Date.now();
        flowchartContainer.appendChild(flowchartDiv);
        header.appendChild(flowchartContainer);

        try {
            const { svg } = await mermaid.render(flowchartDiv.id, data.mermaid);
            // Mermaid 生成的 SVG 是受信任的库输出,可以安全使用
            flowchartDiv.innerHTML = svg;
        } catch (error) {
            console.error('Mermaid渲染失败:', error);
            flowchartContainer.remove();
        }
    }

    container.appendChild(header);

    // 工作流步骤
    if (data.workflow && data.workflow.length > 0) {
        const stepsContainer = document.createElement('div');
        stepsContainer.className = 'workflow-steps';

        data.workflow.forEach(step => {
            stepsContainer.appendChild(createStepCard(step));
        });

        container.appendChild(stepsContainer);
    }

    grid.appendChild(container);
    document.getElementById('resultsQuery').textContent = '工作流推荐';
    document.getElementById('resultsSection').classList.add('active');
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderResults(data) {
    // 判断是简单推荐还是工作流
    if (data.mode === 'workflow' && data.workflow) {
        renderWorkflow(data);
    } else {
        // 简单推荐模式
        const grid = document.getElementById('resultsGrid');
        grid.replaceChildren();
        if (data.recommendations) {
            data.recommendations.forEach(p => grid.appendChild(createProductCard(p)));
        }
        document.getElementById('resultsQuery').textContent = '根据「' + (data.query || data.task) + '」为你推荐';
        document.getElementById('resultsSection').classList.add('active');
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderCases(cases) {
    const grid = document.getElementById('casesGrid');
    grid.replaceChildren();
    cases.forEach(c => grid.appendChild(createCaseCard(c)));
}

async function search() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    saveHistory(query);

    // 检查 Turnstile token
    if (!turnstileToken) {
        alert('请完成人机验证后再试');
        return;
    }

    document.getElementById('loading').classList.add('active');
    document.getElementById('resultsSection').classList.remove('active');
    try {
        const response = await fetch(API_BASE + '/api/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CF-Turnstile-Token': turnstileToken
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '请求失败');
        }

        const data = await response.json();
        renderResults(data);

        // 重置 Turnstile (每次请求后需要重新验证)
        turnstileToken = null;
        turnstile.reset();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || '请求失败，请稍后重试');
        // 重置 Turnstile
        turnstileToken = null;
        turnstile.reset();
    } finally {
        document.getElementById('loading').classList.remove('active');
    }
}

async function loadCases() {
    try {
        const response = await fetch(API_BASE + '/api/cases');
        const data = await response.json();
        renderCases(data.cases);
    } catch (error) {
        console.error('Failed to load cases:', error);
    }
}

document.getElementById('searchBtn').addEventListener('click', search);
document.getElementById('searchInput').addEventListener('keypress', (e) => { if (e.key === 'Enter') search(); });
document.querySelectorAll('.quick-tag').forEach(tag => {
    tag.addEventListener('click', () => { document.getElementById('searchInput').value = tag.dataset.query; search(); });
});
loadCases();

/* --- History Logic --- */
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const container = document.getElementById('searchHistory');
    const tagsContainer = document.getElementById('historyTags');

    if (!container || !tagsContainer) return;

    if (history.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    tagsContainer.innerHTML = '';
    history.forEach(query => {
        const tag = document.createElement('span');
        tag.className = 'history-tag';
        tag.textContent = query;
        tag.onclick = () => {
            document.getElementById('searchInput').value = query;
            search();
        };
        tagsContainer.appendChild(tag);
    });
}

function saveHistory(query) {
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    history = history.filter(h => h !== query); // 去重
    history.unshift(query); // 加到最前
    if (history.length > 10) history = history.slice(0, 10); // 限制10条

    localStorage.setItem('searchHistory', JSON.stringify(history));
    loadHistory();
}

function clearHistory() {
    localStorage.removeItem('searchHistory');
    loadHistory();
}

const clearHistoryBtn = document.getElementById('clearHistory');
if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);

/* --- Favorites Logic --- */
function getFavorites() {
    return JSON.parse(localStorage.getItem('userFavorites') || '[]');
}

function isFavorite(id) {
    const favorites = getFavorites();
    return favorites.some(f => f.id === id);
}

function toggleFavorite(item) {
    let favorites = getFavorites();
    const index = favorites.findIndex(f => f.id === item.id);

    if (index >= 0) {
        favorites.splice(index, 1);
    } else {
        favorites.push({
            id: item.id,
            type: item.type,
            data: item.data,
            timestamp: Date.now()
        });
    }
    localStorage.setItem('userFavorites', JSON.stringify(favorites));
    
    // 如果模态框已打开，刷新它
    if (document.getElementById('favoritesModal').classList.contains('active')) {
        renderFavoritesModal();
    }
}

function renderFavoritesModal() {
    const list = document.getElementById('favoritesList');
    const favorites = getFavorites();

    if (favorites.length === 0) {
        list.innerHTML = '<p class="empty-favorites">暂无收藏内容</p>';
        return;
    }

    list.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'results-grid';
    
    favorites.forEach(fav => {
        if (fav.type === 'tool') {
             const card = createProductCard(fav.data);
             // 在模态框里点击不需要跳转，或者保持跳转？保持跳转比较好
             grid.appendChild(card);
        }
    });
    list.appendChild(grid);
}

// Favorites Event Listeners
const openFavoritesBtn = document.getElementById('openFavoritesBtn');
if (openFavoritesBtn) {
    openFavoritesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        renderFavoritesModal();
        document.getElementById('favoritesModal').classList.add('active');
    });
}

const closeFavoritesModalBtn = document.getElementById('closeFavoritesModal');
if (closeFavoritesModalBtn) {
    closeFavoritesModalBtn.addEventListener('click', () => {
        document.getElementById('favoritesModal').classList.remove('active');
    });
}

const favoritesModal = document.getElementById('favoritesModal');
if (favoritesModal) {
    favoritesModal.addEventListener('click', (e) => {
        if (e.target === favoritesModal) {
            favoritesModal.classList.remove('active');
        }
    });
}

// Initialize
loadHistory();
