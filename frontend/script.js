// Production backend URL
let API_BASE_URL = 'http://localhost:3000';
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    API_BASE_URL = 'https://website-download.onrender.com';
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const SUN_SVG = '<svg class="svg-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
const MOON_SVG = '<svg class="svg-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
const COPY_SVG = '<svg class="svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_SVG = '<svg class="svg-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

// ─── Backend Status ──────────────────────────────────────────────────────────
let backendStatus = 'checking';
let wakeupInterval = null;
let wakeupSeconds = 0;

const statusBar       = document.getElementById('backend-status-bar');
const statusLabel     = document.getElementById('backend-status-label');
const wakeupContainer = document.getElementById('wakeup-container');
const wakeupTimerEl   = document.getElementById('wakeup-timer');

function setBackendStatus(state, label) {
    backendStatus = state;
    if (statusBar) statusBar.className = `backend-status ${state}`;
    if (statusLabel) {
        if (label) {
            statusLabel.textContent = label;
        } else if (state === 'awake') {
            statusLabel.textContent = 'Server Ready';
        } else if (state === 'sleeping') {
            statusLabel.textContent = 'Server Sleeping 💤';
        } else {
            statusLabel.textContent = 'Checking server...';
        }
    }
}

async function pingBackend() {
    if (!statusBar) return;
    setBackendStatus('checking');
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 6000);
    const t0 = Date.now();
    try {
        await fetch(`${API_BASE_URL}/`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const elapsed = Date.now() - t0;
        setBackendStatus(elapsed < 4000 ? 'awake' : 'sleeping');
    } catch {
        clearTimeout(timeoutId);
        setBackendStatus('sleeping');
    }
}

function startWakeupTimer() {
    if (!wakeupContainer || !wakeupTimerEl) return;
    wakeupSeconds = 0;
    wakeupTimerEl.textContent = '0s';
    wakeupContainer.classList.remove('hidden');
    wakeupInterval = setInterval(() => {
        wakeupSeconds++;
        wakeupTimerEl.textContent = `${wakeupSeconds}s`;
    }, 1000);
}

function stopWakeupTimer() {
    if (wakeupInterval) {
        clearInterval(wakeupInterval);
        wakeupInterval = null;
    }
    if (wakeupContainer) wakeupContainer.classList.add('hidden');
}

if (statusBar) {
    pingBackend();
}

// ─── Main App ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // ── Theme Toggle ──────────────────────────────────────────────────────────
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    if (themeToggleBtn) {
        if (localStorage.getItem('theme') === 'light') {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            themeToggleBtn.innerHTML = MOON_SVG;
        } else {
            themeToggleBtn.innerHTML = SUN_SVG;
        }

        themeToggleBtn.addEventListener('click', () => {
            if (body.classList.contains('light-mode')) {
                body.classList.remove('light-mode');
                body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.innerHTML = SUN_SVG;
            } else {
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
                themeToggleBtn.innerHTML = MOON_SVG;
            }
        });
    }

    // ── Mode Selection ────────────────────────────────────────────────────────
    const modeCards = document.querySelectorAll('.mode-card');
    let currentMode = 'inlined';

    if (modeCards.length > 0) {
        modeCards.forEach(card => {
            card.addEventListener('click', () => {
                modeCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentMode = card.getAttribute('data-mode');
            });

            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    // ── Paste Button ──────────────────────────────────────────────────────────
    const pasteBtn = document.getElementById('paste-btn');
    const urlInput = document.getElementById('url-input');

    if (pasteBtn && urlInput) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                urlInput.value = text;
            } catch (err) {
                console.error('Failed to read clipboard contents: ', err);
            }
        });
    }

    // ── Download Button ───────────────────────────────────────────────────────
    const downloadBtn       = document.getElementById('download-btn');
    const urlError          = document.getElementById('url-error');
    const progressContainer = document.getElementById('progress-container');
    const statusText        = document.getElementById('status-text');
    const progressFill      = document.getElementById('progress-fill');

    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    if (downloadBtn && urlInput) {
        downloadBtn.addEventListener('click', async () => {
            const url = urlInput.value.trim();

            if (!url || !isValidUrl(url)) {
                if (urlError) urlError.style.display = 'block';
                return;
            }
            if (urlError) urlError.style.display = 'none';

            downloadBtn.disabled = true;

            const wasSleeping = backendStatus === 'sleeping';
            if (wasSleeping) {
                startWakeupTimer();
                setBackendStatus('checking', 'Waking up... ☕');
            } else if (progressContainer && statusText && progressFill) {
                progressContainer.classList.remove('hidden');
                statusText.innerText = 'Downloading and Compressing...';
                statusText.style.color = '';
                progressFill.classList.add('loading');
            }

            try {
                const response = await fetch(`${API_BASE_URL}/download`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url, mode: currentMode })
                });

                if (wasSleeping) {
                    stopWakeupTimer();
                    setBackendStatus('awake');
                    if (progressContainer && statusText && progressFill) {
                        progressContainer.classList.remove('hidden');
                        statusText.innerText = 'Downloading and Compressing...';
                        statusText.style.color = '';
                        progressFill.classList.add('loading');
                    }
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Server responded with ${response.status}`);
                }

                let filename = `download-${Date.now()}.zip`;
                const disposition = response.headers.get('content-disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }

                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();

                setTimeout(() => {
                    a.remove();
                    window.URL.revokeObjectURL(downloadUrl);
                }, 15000);

                addToHistory(url, currentMode);
                if (statusText) {
                    statusText.innerText = 'Ready!';
                    statusText.style.color = '';
                }
                setBackendStatus('awake');

            } catch (error) {
                console.error('Download error:', error);
                stopWakeupTimer();
                if (progressContainer && statusText) {
                    progressContainer.classList.remove('hidden');
                    statusText.innerText = `Error: ${error.message}`;
                    statusText.style.color = 'var(--color-error)';
                }
                setBackendStatus('sleeping');
            } finally {
                downloadBtn.disabled = false;
                if (progressFill) {
                    progressFill.classList.remove('loading');
                    progressFill.style.width = '100%';
                }

                setTimeout(() => {
                    if (statusText && statusText.innerText === 'Ready!' && progressContainer && progressFill) {
                        progressContainer.classList.add('hidden');
                        progressFill.style.width = '0%';
                    }
                }, 3000);
            }
        });
    }

    // ── Drag and Drop ─────────────────────────────────────────────────────────
    const dropZone = document.getElementById('drop-zone');
    if (dropZone && urlInput) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--color-primary)';
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border-color)';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border-color)';
            const text = e.dataTransfer.getData('text');
            if (text) urlInput.value = text;
        });
    }

    // ── Keyboard Shortcut: Ctrl/Cmd + Enter ───────────────────────────────────
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (downloadBtn && !downloadBtn.disabled) downloadBtn.click();
        }
    });

    // ── History ───────────────────────────────────────────────────────────────
    const historyList     = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    let sessionHistory = [];

    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';
        if (sessionHistory.length === 0) {
            historyList.innerHTML = '<li class="empty-history">No recent downloads in this session.</li>';
            return;
        }

        sessionHistory.forEach((item) => {
            const li = document.createElement('li');
            li.className = 'history-item';

            const urlSpan = document.createElement('span');
            urlSpan.className = 'history-url';
            urlSpan.textContent = item.url;
            urlSpan.title = item.url;

            const metaDiv = document.createElement('div');
            metaDiv.className = 'history-meta';

            const modeSpan = document.createElement('span');
            modeSpan.textContent = item.mode.toUpperCase();

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.title = 'Copy Original URL';
            copyBtn.innerHTML = COPY_SVG;
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(item.url);
                copyBtn.innerHTML = CHECK_SVG;
                setTimeout(() => {
                    copyBtn.innerHTML = COPY_SVG;
                }, 2000);
            });

            metaDiv.appendChild(modeSpan);
            metaDiv.appendChild(copyBtn);
            li.appendChild(urlSpan);
            li.appendChild(metaDiv);
            historyList.appendChild(li);
        });
    }

    function addToHistory(url, mode) {
        sessionHistory.unshift({ url, mode, timestamp: Date.now() });
        if (sessionHistory.length > 5) sessionHistory.pop();
        renderHistory();
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            sessionHistory = [];
            renderHistory();
        });
    }

    // ─── GSAP Motion & Micro-Physics ──────────────────────────────────────────
    function initGSAPAnimations() {
        if (typeof gsap === 'undefined') return;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Interactive tactile card micro-physics
        const cards = document.querySelectorAll('.mode-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, { y: -4, duration: 0.2, ease: 'power2.out', overwrite: 'auto' });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { y: 0, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
            });
            card.addEventListener('click', () => {
                gsap.fromTo(card, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'back.out(2)', overwrite: 'auto' });
            });
        });

        // Interactive paste button bounce
        if (pasteBtn) {
            pasteBtn.addEventListener('click', () => {
                gsap.fromTo(pasteBtn, { scale: 0.8 }, { scale: 1, duration: 0.35, ease: 'back.out(2.5)' });
            });
        }

        // Tactile download button feedback
        if (downloadBtn) {
            downloadBtn.addEventListener('mousedown', () => {
                gsap.to(downloadBtn, { scale: 0.97, duration: 0.1 });
            });
            downloadBtn.addEventListener('mouseup', () => {
                gsap.to(downloadBtn, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
            });
        }
    }

    // Initialize GSAP micro-interactions safely
    initGSAPAnimations();
});

