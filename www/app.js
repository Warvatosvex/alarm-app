function updateRadioUI() { document.querySelectorAll('.radio-card, .mode-card').forEach(c => { const r = c.querySelector('input'); if (r) c.classList.toggle('selected', r.checked); }); }
'use strict';

// ============================================
// STATE
// ============================================
let state = {
    alarms: [],
    editingId: null,
    isRinging: false,
    activeAlarm: null,
    selectedDays: [1, 2, 3, 4, 5],
    currentTab: 'alarms',
    bottomNavShown: true,
    seriesConfig: {
        startTime: '06:00',
        endTime: '07:25',
        step: 5,
        days: [1, 2, 3, 4, 5],
        mode: 'math',
        difficulty: 3,
        rounds: 1,
        enabled: false
    },
    reminders: [],
    timerState: {
        hours: 0,
        minutes: 30,
        seconds: 0,
        running: false,
        intervalId: null
    },
    stopwatchState: {
        minutes: 0,
        seconds: 0,
        centiseconds: 0,
        running: false,
        intervalId: null,
        laps: []
    }
};

// ============================================
// AUDIO / SIREN
// ============================================
let audioCtx = null;
let sirenTimer = null, sirenOsc = [], sirenGain = null;
let wakeLock = null;

// ============================================
// TASK STATE
// ============================================
let taskState = {
    step: 0,
    total: 0,
    difficulty: 3,
    mode: 'math',
    currentAnswer: null,
    memorySequence: [],
    memoryUserIdx: 0,
    memoryPlaying: false,
    // Marathon state
    marathonIdx: 0,
    marathonTasks: ['math', 'code', 'memory', 'pairs', 'targets', 'riddles', 'odd'],
    marathonRunning: false
};

// ============================================
// DOM ELEMENTS
// ============================================
let dom = {};

function cacheDom() {
    dom.topClock = document.getElementById('top-clock');
    dom.banner = document.getElementById('next-alarm-banner');
    dom.alarmList = document.getElementById('alarm-list');
    dom.fab = document.getElementById('fab-add');
    dom.btnTest = document.getElementById('btn-test-alarm');
    dom.modal = document.getElementById('alarm-modal');
    dom.mTime = document.getElementById('edit-time');
    dom.mLabel = document.getElementById('edit-label');
    dom.mSound = document.getElementById('edit-sound');
    dom.mDiff = document.getElementById('edit-difficulty');
    dom.mRounds = document.getElementById('edit-rounds');
    dom.mDiffLabel = document.getElementById('val-diff-label');
    dom.mRoundsLabel = document.getElementById('val-rounds');
    dom.btnSave = document.getElementById('btn-save');
    dom.btnDelete = document.getElementById('btn-delete');
    dom.btnClose = document.getElementById('modal-close');
    dom.ringOverlay = document.getElementById('ringing-overlay');
    dom.ringClock = document.getElementById('ring-clock');
    dom.ringLabel = document.getElementById('ring-label');
    dom.ringInfo = document.getElementById('ring-task-info');
    dom.ringProgress = document.getElementById('ring-progress-bar');
    dom.ringFeedback = document.getElementById('ring-feedback');
    dom.taskBody = document.getElementById('task-body');
    dom.tabNav = document.querySelector('.tab-nav');
    dom.contentArea = document.getElementById('content-area');

    // Series DOM
    dom.seriesStart = document.getElementById('series-start');
    dom.seriesEnd = document.getElementById('series-end');
    dom.seriesStep = document.getElementById('series-step');
    dom.seriesDifficulty = document.getElementById('series-difficulty');
    dom.seriesRounds = document.getElementById('series-rounds');
    dom.seriesDaysSelector = document.getElementById('series-days-selector');
    dom.seriesModeSelector = document.getElementById('series-mode-selector');

    // Timer DOM
    dom.timerHours = document.getElementById('timer-hours');
    dom.timerMinutes = document.getElementById('timer-minutes');
    dom.timerSeconds = document.getElementById('timer-seconds');
    dom.btnStartTimer = document.getElementById('btn-start-timer');
    dom.btnPauseTimer = document.getElementById('btn-pause-timer');
    dom.btnResetTimer = document.getElementById('btn-reset-timer');

    // Stopwatch DOM
    dom.stopwatchDisplay = document.getElementById('stopwatch-display');
    dom.btnStartStopwatch = document.getElementById('btn-start-stopwatch');
    dom.btnLapStopwatch = document.getElementById('btn-lap-stopwatch');
    dom.btnResetStopwatch = document.getElementById('btn-reset-stopwatch');

    // Reminder DOM
    dom.remindersList = document.getElementById('reminders-list');
    dom.btnAddReminder = document.getElementById('btn-add-reminder');
}

// ============================================
// DIFFICULTY NAMES
// ============================================
const diffNames = ["", "Лёгкий", "Обычный", "Средний", "Сложный", "Хардкор"];

// ============================================
// INIT
// ============================================
function init() {
    cacheDom();
    renderList();
    updateBanner();
    bindEvents();
    setupTabNavigation();
    updateTimerDisplay();
    updateStopwatchDisplay();
    setInterval(tick, 1000);
}

// ============================================
// TAB NAVIGATION
// ============================================
function setupTabNavigation() {
    let bottomNav = document.querySelector('.bottom-nav');
    if (!bottomNav) {
        bottomNav = document.createElement('div');
        bottomNav.className = 'bottom-nav';
        bottomNav.innerHTML = `
            <button class="bottom-nav-btn ${state.currentTab === 'alarms' ? 'active' : ''}" data-tab="alarms">
                <span class="icon">⏰</span>
                <span>Будильники</span>
            </button>
            <button class="bottom-nav-btn ${state.currentTab === 'series' ? 'active' : ''}" data-tab="series">
                <span class="icon">🔁</span>
                <span>Серия</span>
            </button>
            <button class="bottom-nav-btn ${state.currentTab === 'timer' ? 'active' : ''}" data-tab="timer">
                <span class="icon">⏳</span>
                <span>Таймер</span>
            </button>
            <button class="bottom-nav-btn ${state.currentTab === 'stopwatch' ? 'active' : ''}" data-tab="stopwatch">
                <span class="icon">⏱️</span>
                <span>Секундомер</span>
            </button>
        `;
        document.body.appendChild(bottomNav);
    }

    const bottomNavBtns = bottomNav.querySelectorAll('.bottom-nav-btn');
    bottomNavBtns.forEach(btn => {
        const tab = btn.dataset.tab;
        btn.classList.toggle('active', state.currentTab === tab);
    });

    bottomNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            changeTab(btn.dataset.tab);
        });
    });
}

function changeTab(tab) {
    state.currentTab = tab;

    // Update bottom nav
    const bottomNavBtns = document.querySelectorAll('.bottom-nav-btn');
    bottomNavBtns.forEach(btn => {
        btn.classList.toggle('active', state.currentTab === btn.dataset.tab);
    });

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected
    const activeSection = document.getElementById(tab + '-tab');
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }

    // Refresh content
    if (tab === 'alarms') {
        renderList();
        updateBanner();
    } else if (tab === 'series') {
        // Already rendered
    } else if (tab === 'reminders') {
        renderRemindersList();
    } else if (tab === 'timer') {
        updateTimerDisplay();
    } else if (tab === 'stopwatch') {
        updateStopwatchDisplay();
    }
}

// ============================================
// TICK / CLOCK
// ============================================
function tick() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    if (dom.topClock) dom.topClock.textContent = timeStr;

    if (state.isRinging && dom.ringClock) {
        dom.ringClock.textContent = timeStr.substring(0, 5);
    }

    // Check alarms every minute at seconds = 0
    if (now.getSeconds() === 0 && !state.isRinging) {
        checkAlarms(now);
        checkSeries(now);
        checkReminders(now);
    }
}

function checkAlarms(now) {
    state.alarms.forEach(a => {
        if (a.enabled && a.time) {
            const [h, m] = a.time.split(':').map(Number);
            const alarmDate = new Date(now);
            alarmDate.setHours(h, m, 0, 0);
            if (alarmDate <= now) alarmDate.setDate(alarmDate.getDate() + 1);
            const diff = alarmDate - now;
            if (diff >= 0 && diff < 60000) {
                startRinging(a);
            }
        }
    });
}

function checkSeries(now) {
    if (!state.seriesConfig.enabled) return;
    const startParts = state.seriesConfig.startTime.split(':').map(Number);
    const endParts = state.seriesConfig.endTime.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        const diff = currentMinutes - startMinutes;
        if (diff % state.seriesConfig.step === 0) {
            const t = diff / state.seriesConfig.step;
            const alarmTime = `${String(Math.floor(startMinutes / 60)).padStart(2, '0')}:${String(startMinutes % 60).padStart(2, '0')}`;
            startRinging({
                id: 'series_' + t,
                time: alarmTime,
                label: 'Серия',
                difficulty: state.seriesConfig.difficulty,
                rounds: state.seriesConfig.rounds,
                mode: state.seriesConfig.mode,
                sound: 'siren',
                enabled: true,
                days: state.seriesConfig.days
            });
        }
    }
}

function checkReminders(now) {
    state.reminders.forEach(r => {
        if (!r.enabled || !r.datetime) return;
        const rDate = new Date(r.datetime);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const rMinutes = rDate.getHours() * 60 + rDate.getMinutes();
        if (currentMinutes >= rMinutes && Math.abs(currentMinutes - rMinutes) < 60) {
            startRinging({
                id: 'reminder_' + r.id,
                time: r.time || '00:00',
                label: r.label || 'Напоминание',
                difficulty: r.difficulty || 0,
                rounds: 1,
                mode: 'math',
                sound: r.sound || 'siren',
                enabled: true
            });
        }
    });
}

// ============================================
// EVENT BINDING
// ============================================
function bindEvents() {
    // FAB
    if (dom.fab) {
        dom.fab.addEventListener('click', openModal);
        dom.fab.addEventListener('touchstart', (e) => { e.preventDefault(); openModal(); });
    }

    // Test alarm
    if (dom.btnTest) {
        dom.btnTest.addEventListener('click', () => startRinging({
            id: 'test',
            time: '00:00',
            label: 'Тестовый будильник',
            difficulty: 3,
            rounds: 3,
            mode: 'math',
            sound: 'siren'
        }));
        dom.btnTest.addEventListener('touchstart', (e) => { e.preventDefault(); runTest(); });
    }

    // Modal close
    if (dom.btnClose) {
        dom.btnClose.addEventListener('click', closeModal);
        dom.btnClose.addEventListener('touchstart', (e) => { e.preventDefault(); closeModal(); });
    }

    // Difficulty label
    if (dom.mDiff) {
        dom.mDiff.addEventListener('input', () => {
            if (dom.mDiffLabel) dom.mDiffLabel.textContent = diffNames[dom.mDiff.value];
        });
    }
    if (dom.mRounds) {
        dom.mRounds.addEventListener('input', () => {
            if (dom.mRoundsLabel) dom.mRoundsLabel.textContent = dom.mRounds.value;
        });
    }

    // Save
    if (dom.btnSave) {
        dom.btnSave.addEventListener('click', save);
        dom.btnSave.addEventListener('touchstart', (e) => { e.preventDefault(); save(); });
    }
    if (dom.btnDelete) {
        dom.btnDelete.addEventListener('click', del);
        dom.btnDelete.addEventListener('touchstart', (e) => { e.preventDefault(); del(); });
    }

    // Day buttons
    document.querySelectorAll('.day-btn').forEach(btn => {
        const toggleDay = (e) => {
            e.preventDefault();
            const day = parseInt(btn.dataset.day);
            if (state.selectedDays.includes(day)) {
                state.selectedDays = state.selectedDays.filter(d => d !== day);
            } else {
                state.selectedDays.push(day);
            }
            btn.classList.toggle('selected', state.selectedDays.includes(day));
        };
        btn.addEventListener('click', toggleDay);
        btn.addEventListener('touchstart', toggleDay);
    });

    // Radio buttons
    document.querySelectorAll('.radio-card').forEach(c => {
        c.addEventListener('click', (e) => {
            e.preventDefault();
            const radio = c.querySelector('input');
            if (radio) {
                radio.checked = true;
                updateRadioUI();
            }
        });
    });

    // Tab setup
    setupTabNavigation();

    // FAB add alarm
    if (dom.fab) {
        dom.fab.addEventListener('click', openModal);
        dom.fab.addEventListener('touchstart', (e) => { e.preventDefault(); openModal(); });
    }

    // Add alarm button
    const btnAddAlarm = document.getElementById('btn-add-alarm');
    if (btnAddAlarm) {
        btnAddAlarm.addEventListener('click', () => openModal());
    }

    // Series generation
    const btnGenerateSeries = document.getElementById('btn-generate-series');
    if (btnGenerateSeries) {
        btnGenerateSeries.addEventListener('click', generateSeries);
    }

    // Enable series
    const btnEnableSeries = document.getElementById('btn-enable-series');
    if (btnEnableSeries) {
        btnEnableSeries.addEventListener('click', enableSeries);
    }

    // Series config
    if (dom.seriesStart) dom.seriesStart.addEventListener('change', updateSeriesConfig);
    if (dom.seriesEnd) dom.seriesEnd.addEventListener('change', updateSeriesConfig);
    if (dom.seriesStep) dom.seriesStep.addEventListener('input', updateSeriesConfig);
    if (dom.seriesDifficulty) dom.seriesDifficulty.addEventListener('input', () => {
        if (dom.mDiffLabel) dom.mDiffLabel.textContent = diffNames[dom.seriesDifficulty.value];
    });
    if (dom.seriesRounds) dom.seriesRounds.addEventListener('input', () => {
        if (dom.mRoundsLabel) dom.mRoundsLabel.textContent = dom.seriesRounds.value;
    });
    if (dom.seriesDaysSelector) {
        dom.seriesDaysSelector.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const day = parseInt(btn.dataset.day);
                if (state.seriesConfig.days.includes(day)) {
                    state.seriesConfig.days = state.seriesConfig.days.filter(d => d !== day);
                } else {
                    state.seriesConfig.days.push(day);
                }
                btn.classList.toggle('selected', state.seriesConfig.days.includes(day));
            });
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); toggleDaySeries(btn); });
        });
    }
    if (dom.seriesModeSelector) {
        dom.seriesModeSelector.querySelectorAll('.radio-card').forEach(c => {
            c.addEventListener('click', (e) => {
                e.preventDefault();
                const radio = c.querySelector('input');
                if (radio) {
                    radio.checked = true;
                    updateRadioUI();
                }
            });
        });
    }

    // Timer buttons
    if (dom.btnStartTimer) dom.btnStartTimer.addEventListener('click', startTimer);
    if (dom.btnPauseTimer) dom.btnPauseTimer.addEventListener('click', pauseTimer);
    if (dom.btnResetTimer) dom.btnResetTimer.addEventListener('click', resetTimer);

    // Timer task
    const timerTaskBox = document.querySelector('label[for="timer-task-require"]');
    if (timerTaskBox) {
        timerTaskBox.addEventListener('click', (e) => { e.stopPropagation(); });
    }

    // Stopwatch buttons
    if (dom.btnStartStopwatch) dom.btnStartStopwatch.addEventListener('click', startStopwatch);
    if (dom.btnLapStopwatch) dom.btnLapStopwatch.addEventListener('click', lapStopwatch);
    if (dom.btnResetStopwatch) dom.btnResetStopwatch.addEventListener('click', resetStopwatch);

    // Reminder add
    if (dom.btnAddReminder) dom.btnAddReminder.addEventListener('click', openReminderModal);

    // Window focus / lock task
    window.addEventListener('focus', () => {
        try { startLockTask(); } catch (e) {}
    });
    window.addEventListener('blur', () => {
        try { stopLockTask(); } catch (e) {}
    });
}

// ============================================
// MODAL / ALARM
// ============================================
function openModal(id = null) {
    state.editingId = id;
    const a = id ? state.alarms.find(x => x.id === id) : null;
    if (dom.mTime) dom.mTime.value = a ? a.time : "07:30";
    if (dom.mLabel) dom.mLabel.value = a ? a.label : "";
    if (dom.mSound) dom.mSound.value = a ? a.sound : "siren";
    if (dom.mDiff) dom.mDiff.value = a ? a.difficulty : 3;
    if (dom.mRounds) dom.mRounds.value = a ? a.rounds : 5;
    if (dom.mDiffLabel) dom.mDiffLabel.textContent = diffNames[dom.mDiff.value];
    if (dom.mRoundsLabel) dom.mRoundsLabel.textContent = dom.mRounds.value;

    state.selectedDays = a ? [...(a.days || [1,2,3,4,5])] : [1,2,3,4,5];
    document.querySelectorAll('.day-btn').forEach(btn => {
        const day = parseInt(btn.dataset.day);
        btn.classList.toggle('selected', state.selectedDays.includes(day));
    });

    const mode = a ? a.mode : 'math';
    const modeInput = document.querySelector(`input[name="edit-mode"][value="${mode}"]`);
    if (modeInput) modeInput.checked = true;
    updateRadioUI();

    if (dom.btnDelete) dom.btnDelete.style.display = a ? "flex" : "none";
    if (dom.modal) dom.modal.classList.add('active');
}

function closeModal() {
    if (dom.modal) dom.modal.classList.remove('active');
}

function openReminderModal() {
    state.editingId = null;
    if (dom.mTime) dom.mTime.value = "";
    if (dom.mLabel) dom.mLabel.value = "";
    if (dom.mSound) dom.mSound.value = "siren";
    if (dom.mDiff) dom.mDiff.value = 0;
    if (dom.mRounds) dom.mRounds.value = 5;
    if (dom.mDiffLabel) dom.mDiffLabel.textContent = diffNames[0];
    if (dom.mRoundsLabel) dom.mRoundsLabel.textContent = "5";

    state.selectedDays = [];
    document.querySelectorAll('.day-btn').forEach(btn => {
        const day = parseInt(btn.dataset.day);
        btn.classList.toggle('selected', state.selectedDays.includes(day));
    });

    if (dom.btnDelete) dom.btnDelete.classList.add('hidden');
    if (dom.modal) dom.modal.classList.add('active');
}

function save() {
    const mode = (document.querySelector('input[name="edit-mode"]:checked') || {}).value || 'math';

    if (state.currentTab === 'reminders') {
        const newReminder = {
            id: state.editingId || Date.now().toString(),
            label: dom.mLabel && dom.mLabel.value ? dom.mLabel.value : 'Напоминание',
            datetime: dom.mTime ? dom.mTime.value : null,
            sound: dom.mSound ? dom.mSound.value : 'siren',
            difficulty: dom.mDiff ? parseInt(dom.mDiff.value) : 0,
            enabled: true
        };

        if (state.editingId) {
            const i = state.reminders.findIndex(x => x.id === state.editingId);
            if (i !== -1) state.reminders[i] = newReminder;
        } else {
            state.reminders.push(newReminder);
        }
        localStorage.setItem('reminders_v1', JSON.stringify(state.reminders));
        renderRemindersList();
        closeModal();
        return;
    }

    const newAlarm = {
        id: state.editingId || Date.now().toString(),
        time: dom.mTime ? dom.mTime.value : "07:30",
        label: dom.mLabel && dom.mLabel.value ? dom.mLabel.value : "Будильник",
        sound: dom.mSound ? dom.mSound.value : "siren",
        difficulty: dom.mDiff ? parseInt(dom.mDiff.value) : 3,
        rounds: dom.mRounds ? parseInt(dom.mRounds.value) : 5,
        days: [...state.selectedDays],
        mode: mode,
        enabled: true
    };

    if (state.editingId) {
        const i = state.alarms.findIndex(x => x.id === state.editingId);
        if (i !== -1) state.alarms[i] = newAlarm;
    } else {
        state.alarms.push(newAlarm);
    }

    syncAndPersist();
    closeModal();
}

function del() {
    if (!state.editingId) return;
    state.alarms = state.alarms.filter(x => x.id !== state.editingId);
    syncAndPersist();
    closeModal();
}

function syncAndPersist() {
    try {
        localStorage.setItem('alarms_v5', JSON.stringify(state.alarms));
    } catch (e) {
        console.error("LocalStorage save error:", e);
    }
    renderList();
    updateBanner();
}

// ============================================
// LIST RENDERING
// ============================================
function renderList() {
    if (!dom.alarmList) return;
    dom.alarmList.innerHTML = state.alarms.sort((a,b) => a.time.localeCompare(b.time)).map(a => {
        const dayNamesShort = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
        const daysText = (!a.days || a.days.length === 7) ? "Каждый день" : (a.days.length === 0 ? "Один раз" : a.days.map(d => dayNamesShort[d]).join(', '));
        return `
            <div class="alarm-card ${a.enabled ? '' : 'disabled'}" data-alarm-id="${a.id}">
                <div class="alarm-card-left" data-alarm-id="${a.id}">
                    <div class="alarm-card-time">${a.time}</div>
                    <div class="alarm-card-label">${a.label}</div>
                    <div class="alarm-card-meta">
                        <span class="badge">${daysText}</span>
                        <span class="badge difficulty-${a.difficulty}">${diffNames[a.difficulty]}</span>
                        <span class="badge">${a.mode.toUpperCase()} × ${a.rounds}</span>
                    </div>
                </div>
                <label class="switch" data-alarm-id="${a.id}">
                    <input type="checkbox" ${a.enabled ? 'checked' : ''} data-alarm-id="${a.id}">
                    <span class="slider"></span>
                </label>
            </div>
        `;
    }).join('');

    dom.alarmList.querySelectorAll('.alarm-card').forEach(card => {
        const alarmId = card.dataset.alarmId;
        const leftPart = card.querySelector('.alarm-card-left');
        const switchInput = card.querySelector('input[type="checkbox"]');

        const handleCardClick = (e) => {
            e.stopPropagation();
            openModal(alarmId);
        };

        const handleSwitchChange = (e) => {
            e.stopPropagation();
            const a = state.alarms.find(x => x.id === alarmId);
            if (a) {
                a.enabled = switchInput.checked;
                syncAndPersist();
            }
        };

        if (leftPart) {
            leftPart.addEventListener('click', handleCardClick);
            leftPart.addEventListener('touchstart', (e) => { e.preventDefault(); handleCardClick(e); });
        }

        if (switchInput) {
            switchInput.addEventListener('change', handleSwitchChange);
            switchInput.addEventListener('click', (e) => e.stopPropagation());
        }
    });

    updateBanner();
}

function updateBanner() {
    if (!dom.banner) return;
    const now = new Date();
    let min = Infinity;
    state.alarms.forEach(a => {
        if (!a.enabled || !a.time) return;
        const [h, m] = a.time.split(':').map(Number);
        let t = new Date(now);
        t.setHours(h, m, 0, 0);
        if (t <= now) t.setDate(t.getDate() + 1);
        const d = t - now;
        if (d < min) min = d;
    });
    if (min === Infinity) dom.banner.innerHTML = "<span>💤 Нет активных будильников</span>";
    else {
        const h = Math.floor(min/3600000), m = Math.floor((min%3600000)/60000);
        dom.banner.innerHTML = `<span>🔔 Следующий через ${h} ч. ${m} мин.</span>`;
    }
}

// ============================================
// TIMER
// ============================================
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

function renderTimer() {
    if (state.timerState.running) {
        const startTime = state.timerState.intervalStart || Date.now();
        const elapsed = Date.now() - startTime;
        const remaining = (state.timerState.hours * 3600000 + state.timerState.minutes * 60000 + state.timerState.seconds * 1000) - elapsed;
        if (remaining <= 0) {
            clearInterval(state.timerState.intervalId);
            state.timerState.running = false;
            document.getElementById('btn-start-timer').style.display = 'inline-block';
            document.getElementById('btn-pause-timer').style.display = 'none';
            startRinging({ id: 'timer', time: '00:00', label: 'Таймер', difficulty: 3, rounds: 1, mode: 'math', sound: 'siren', enabled: true });
            return;
        }
        document.getElementById('timer-display').textContent = formatTime(remaining);
    }
}

function startTimer() {
    const hours = parseInt(dom.timerHours.value) || 0;
    const minutes = parseInt(dom.timerMinutes.value) || 0;
    const seconds = parseInt(dom.timerSeconds.value) || 0;
    state.timerState = {
        hours,
        minutes,
        seconds,
        running: true,
        intervalStart: Date.now(),
        intervalId: setInterval(renderTimer, 10)
    };
    document.getElementById('btn-start-timer').style.display = 'none';
    document.getElementById('btn-pause-timer').style.display = 'inline-block';
}

function pauseTimer() {
    clearInterval(state.timerState.intervalId);
    state.timerState.running = false;
    document.getElementById('btn-start-timer').style.display = 'inline-block';
    document.getElementById('btn-pause-timer').style.display = 'none';
}

function resetTimer() {
    clearInterval(state.timerState.intervalId);
    state.timerState = {
        hours: 0, minutes: 30, seconds: 0, running: false
    };
    document.getElementById('timer-display').textContent = '00:30:00';
    document.getElementById('btn-start-timer').style.display = 'inline-block';
    document.getElementById('btn-pause-timer').style.display = 'none';
}

// ============================================
// STOPWATCH
// ============================================
function formatTime2(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

function renderStopwatch() {
    if (state.stopwatchState.running) {
        const elapsed = Date.now() - (state.stopwatchState.intervalStart || Date.now());
        const totalMs = elapsed + (state.stopwatchState.laps.reduce((sum, lap) => sum + lap.ms, 0) || 0);
        document.getElementById('stopwatch-display').textContent = formatTime2(totalMs);
    }
}

function startStopwatch() {
    state.stopwatchState = {
        minutes: 0,
        seconds: 0,
        centiseconds: 0,
        running: true,
        intervalStart: Date.now()
    };
    document.getElementById('btn-start-stopwatch').style.display = 'none';
    document.getElementById('btn-lap-stopwatch').style.display = 'inline-block';
    renderStopwatch();
}

function lapStopwatch() {
    const now = Date.now();
    const elapsed = now - (state.stopwatchState.intervalStart || now);
    state.stopwatchState.laps.push({ ms: elapsed, time: formatTime2(elapsed) });
    renderLapsList();
}

function renderLapsList() {
    const lapsList = document.getElementById('laps-list');
    if (!lapsList) return;
    lapsList.innerHTML = state.stopwatchState.laps.map(lap => `<div style="padding: 8px; border-bottom: 1px solid var(--border); color: var(--text);">${lap.time}</div>`).join('');
}

function resetStopwatch() {
    clearInterval(state.stopwatchState.intervalId);
    state.stopwatchState = {
        minutes: 0, seconds: 0, centiseconds: 0, running: false, intervalStart: Date.now(), laps: []
    };
    document.getElementById('stopwatch-display').textContent = '00:00:00.00';
    document.getElementById('btn-start-stopwatch').style.display = 'inline-block';
    document.getElementById('btn-lap-stopwatch').style.display = 'none';
    renderLapsList();
}

// ============================================
// SERIES
// ============================================
function generateSeries() {
    const startTime = dom.seriesStart ? dom.seriesStart.value : '06:00';
    const endTime = dom.seriesEnd ? dom.seriesEnd.value : '07:25';
    const step = parseInt(dom.seriesStep ? dom.seriesStep.value : '5');
    const rounds = parseInt(dom.seriesRounds ? dom.seriesRounds.value : '1');
    const difficulty = parseInt(dom.seriesDifficulty ? dom.seriesDifficulty.value : '3');
    const mode = (document.querySelector('input[name="series-mode"]:checked') || {}).value || 'math';
    const days = state.seriesConfig.days || [1,2,3,4,5];

    state.seriesConfig = {
        startTime,
        endTime,
        step,
        rounds,
        difficulty,
        mode,
        enabled: true,
        days
    };

    // Generate alarms
    const startParts = startTime.split(':').map(Number);
    const endParts = endTime.split(':').map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    const totalMinutes = endMinutes - startMinutes;
    const count = Math.floor(totalMinutes / step) + 1;

    state.alarms = [];
    for (let i = 0; i < count; i++) {
        const alarmMinutes = startMinutes + i * step;
        const h = Math.floor(alarmMinutes / 60);
        const m = alarmMinutes % 60;
        state.alarms.push({
            id: `series_${i}`,
            time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
            label: 'Серия',
            sound: 'siren',
            difficulty,
            rounds,
            mode,
            days: [...days],
            enabled: true
        });
    }

    syncAndPersist();
    closeModal();
    alert(`Создано ${state.alarms.length} будильников серии`);
}

function enableSeries() {
    state.seriesConfig.enabled = !state.seriesConfig.enabled;
    const btn = document.getElementById('btn-enable-series');
    if (btn) {
        btn.textContent = state.seriesConfig.enabled ? 'Отключить серию' : 'Включить серию';
        btn.style.background = state.seriesConfig.enabled ? '#ff5252' : '#22c55e';
    }
}

// ============================================
// ALARM RINGING
// ============================================
function startRinging(alarm) {
    state.isRinging = true;
    state.activeAlarm = alarm;

    // Stop any previous siren
    stopSound();

    // Show overlay
    if (dom.ringOverlay) {
        dom.ringOverlay.classList.remove('hidden');
        dom.ringOverlay.classList.add('active');
    }

    // Render task
    taskState.difficulty = alarm.difficulty || 3;
    taskState.mode = alarm.mode || 'math';
    taskState.total = alarm.rounds || 1;
    taskState.step = 1;
    taskState.currentAnswer = null;
    taskState.memorySequence = [];
    taskState.memoryUserIdx = 0;
    taskState.memoryPlaying = false;
    taskState.marathonIdx = 0;
    taskState.marathonRunning = false;

    renderTask();

    // Audio
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        sirenGain = audioCtx.createGain();
        sirenGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        sirenGain.gain.exponentialRampToValueAtTime(0.9, audioCtx.currentTime + 3);

        for(let i=0; i<2; i++) {
            const o = audioCtx.createOscillator();
            o.type = 'sawtooth';
            o.frequency.value = i === 0 ? 600 : 800;
            o.connect(sirenGain);
            o.start();
            sirenOsc.push(o);
        }

        let up = true;
        sirenTimer = setInterval(() => {
            if (!sirenOsc[0] || !sirenOsc[1]) return;
            const f1 = up ? 600 : 400, f2 = up ? 900 : 600;
            sirenOsc[0].frequency.exponentialRampToValueAtTime(f1, audioCtx.currentTime + 0.2);
            sirenOsc[1].frequency.exponentialRampToValueAtTime(f2, audioCtx.currentTime + 0.2);
            up = !up;
        }, 300);
    } catch (e) {
        console.error("Audio start error:", e);
    }

    // Lock task
    try { startLockTask(); } catch (e) {}
}

// ============================================
// STOP SOUND
// ============================================
function stopSound() {
    if (sirenTimer) clearInterval(sirenTimer);
    sirenOsc.forEach(o => { try{o.stop();}catch(e){} });
    sirenOsc = [];
    if (sirenGain) { sirenGain.gain.value = 0; sirenGain = null; }
    if (wakeLock) { try { wakeLock.release(); } catch(e){} wakeLock = null; }
    state.isRinging = false;
    state.activeAlarm = null;

    if (dom.ringOverlay) dom.ringOverlay.classList.add('hidden');
    if (dom.taskBody) dom.taskBody.innerHTML = "";

    try { stopLockTask(); } catch (e) {}
}

// ============================================
// LOCK TASK
// ============================================
function startLockTask() {
    try {
        if (window.androidLockTask) window.androidLockTask();
        else if (navigator.lockTask) navigator.lockTask();
    } catch (e) {}
}

function stopLockTask() {
    try {
        if (window.androidUnlockTask) window.androidUnlockTask();
    } catch (e) {}
}

// ============================================
// TASK RENDERING
// ============================================
function renderTask() {
    if (!dom.taskBody) return;
    dom.taskBody.innerHTML = "";
    if (dom.ringFeedback) dom.ringFeedback.textContent = "";
    const d = taskState.difficulty;

    // Check marathon mode
    if (taskState.mode === 'marathon' && taskState.marathonRunning) {
        renderMarathonTask();
        return;
    }

    // Regular mode task rendering
    if (taskState.mode === 'math') {
        const p = genMath(d);
        taskState.currentAnswer = p.ans;
        dom.taskBody.innerHTML = `
            <div style="font-size:1.8rem; text-align:center; margin-bottom:20px; font-weight:800; color:white;">${p.txt} = ?</div>
            <input type="number" id="ans-in" class="input-code" autofocus inputmode="numeric" placeholder="Ответ">
        `;
        const input = document.getElementById('ans-in');
        if (input) {
            const checkMath = () => {
                if (parseInt(input.value) === taskState.currentAnswer) {
                    input.value = "";
                    nextTask(true); // success
                }
            };
            input.addEventListener('input', checkMath);
            input.addEventListener('keyup', checkMath);
            setTimeout(() => input.focus(), 100);
        }
    } else if (taskState.mode === 'memory') {
        renderMemoryTask(d);
    } else if (taskState.mode === 'code') {
        const code = genCode(d);
        taskState.currentAnswer = code;
        dom.taskBody.innerHTML = `
            <div style="font-size:1.4rem; text-align:center; margin-bottom:15px; font-family:monospace; letter-spacing:3px; color:var(--accent-cyan); word-break:break-all;">${code}</div>
            <input type="text" id="code-in" class="input-code" placeholder="Введите код точно" autofocus autocomplete="off">
        `;
        const input = document.getElementById('code-in');
        if (input) {
            const checkCode = () => {
                if (input.value.trim() === taskState.currentAnswer) {
                    input.value = "";
                    nextTask(true); // success
                }
            };
            input.addEventListener('input', checkCode);
            input.addEventListener('keyup', checkCode);
            setTimeout(() => input.focus(), 100);
        }
    } else if (taskState.mode === 'pairs') {
        renderPairsTask(d);
    } else if (taskState.mode === 'targets') {
        renderTargetsTask(d);
    } else if (taskState.mode === 'riddles') {
        renderRiddlesTask(d);
    } else if (taskState.mode === 'odd') {
        renderOddTask(d);
    }
}

// ============================================
// MARATHON TASK RENDERING
// ============================================
function renderMarathonTask() {
    if (!dom.taskBody) return;
    const taskName = taskState.marathonTasks[taskState.marathonIdx];
    taskState.mode = taskName;
    taskState.difficulty = 3; // fixed for marathon

    if (taskName === 'math') {
        const p = genMath(3);
        taskState.currentAnswer = p.ans;
        dom.taskBody.innerHTML = `
            <div style="font-size:1.8rem; text-align:center; margin-bottom:20px; font-weight:800; color:white;">${p.txt} = ?</div>
            <input type="number" id="marathon-ans" class="input-code" autofocus inputmode="numeric" placeholder="Ответ">
        `;
        const input = document.getElementById('marathon-ans');
        if (input) {
            input.addEventListener('input', (e) => {
                if (parseInt(e.target.value) === taskState.currentAnswer) {
                    e.target.value = "";
                    completeMarathonTask();
                }
            });
            input.addEventListener('keyup', (e) => {
                if (parseInt(e.target.value) === taskState.currentAnswer) {
                    e.target.value = "";
                    completeMarathonTask();
                }
            });
            setTimeout(() => input.focus(), 100);
        }
    } else if (taskName === 'code') {
        const code = genCode(3);
        taskState.currentAnswer = code;
        dom.taskBody.innerHTML = `
            <div style="font-size:1.4rem; text-align:center; margin-bottom:15px; font-family:monospace; letter-spacing:3px; color:var(--accent-cyan); word-break:break-all;">${code}</div>
            <input type="text" id="marathon-ans" class="input-code" placeholder="Введите код точно" autofocus autocomplete="off">
        `;
        const input = document.getElementById('marathon-ans');
        if (input) {
            input.addEventListener('input', (e) => {
                if (e.target.value.trim() === taskState.currentAnswer) {
                    e.target.value = "";
                    completeMarathonTask();
                }
            });
            input.addEventListener('keyup', (e) => {
                if (e.target.value.trim() === taskState.currentAnswer) {
                    e.target.value = "";
                    completeMarathonTask();
                }
            });
            setTimeout(() => input.focus(), 100);
        }
    } else if (taskName === 'memory') {
        renderMemoryTask(3);
    } else if (taskName === 'pairs') {
        renderPairsTask(3);
    } else if (taskName === 'targets') {
        renderTargetsTask(3);
    } else if (taskName === 'riddles') {
        renderRiddlesTask(3);
    } else if (taskName === 'odd') {
        renderOddTask(3);
    }
}

function completeMarathonTask() {
    taskState.marathonIdx++;

    if (taskState.marathonIdx >= taskState.marathonTasks.length) {
        // Marathon complete!
        state.isRinging = false;
        stopSound();
        if (dom.ringOverlay) dom.ringOverlay.classList.add('hidden');
        alert("🔥 Марафон завершен! Все 7 заданий пройдены!");
        return;
    }

    // Show next task
    if (dom.ringFeedback) dom.ringFeedback.textContent = `Задание ${taskState.marathonIdx + 1} из ${taskState.marathonTasks.length}`;
    renderTask();
}

// ============================================
// REGULAR TASK COMPLETION HANDLER
// ============================================
function nextTask(success) {
    if (!success) {
        // On error, reset - for marathon this means reset to first task
        if (taskState.mode === 'marathon' && taskState.marathonRunning) {
            taskState.marathonIdx = 0;
            if (dom.ringFeedback) dom.ringFeedback.textContent = "Ошибка! Сброс к первому заданию";
            renderMarathonTask();
            return;
        }
        // For regular mode, just stop ringing or reset
        taskState.step = 1;
        taskState.total = 1;
        renderTask();
        return;
    }

    taskState.step++;

    // Check if we've completed all rounds
    if (taskState.mode === 'marathon' && taskState.marathonRunning) {
        if (taskState.step > taskState.total) {
            // This shouldn't happen with marathon, but handle it
            completeMarathonTask();
            return;
        }
        // Just render next task in sequence
        renderMarathonTask();
        return;
    }

    if (taskState.step > taskState.total) {
        // All rounds complete
        state.isRinging = false;
        stopSound();
        if (dom.ringOverlay) dom.ringOverlay.classList.add('hidden');
        return;
    }

    renderTask();
}

// ============================================
// MEMORY TASK
// ============================================
function renderMemoryTask(d) {
    const size = d <= 2 ? 3 : (d <= 4 ? 4 : 5);
    const count = 2 + d;
    const seq = [];
    for(let i=0; i<count; i++) seq.push(Math.floor(Math.random() * size * size));
    taskState.memorySequence = seq;
    taskState.memoryUserIdx = 0;
    taskState.memoryPlaying = true;

    const gridClass = `grid-${size}`;
    const tileClass = size === 5 ? "tile-sm" : "";
    dom.taskBody.innerHTML = `<div class="memory-grid ${gridClass}" id="mem-grid"></div>`;
    const grid = document.getElementById('mem-grid');
    for(let i=0; i<size*size; i++) {
        const t = document.createElement('div');
        t.className = `memory-tile ${tileClass}`;
        t.dataset.idx = i;
        grid.appendChild(t);
    }

    let i = 0;
    const speed = 550 - (d * 50);
    const itv = setInterval(() => {
        if (i < seq.length) {
            const t = grid.children[seq[i]];
            if (t) {
                t.classList.add('lit');
                setTimeout(() => t.classList.remove('lit'), speed/2);
            }
            i++;
        } else {
            clearInterval(itv);
            taskState.memoryPlaying = false;
            if (dom.ringFeedback) dom.ringFeedback.textContent = "Повторите последовательность!";
        }
    }, speed);

    const handleTileClick = (e) => {
        if (taskState.memoryPlaying) return;
        const t = e.target.closest('.memory-tile');
        if (!t) return;
        const idx = parseInt(t.dataset.idx);
        t.classList.add('active');
        setTimeout(() => t.classList.remove('active'), 100);

        if (idx === taskState.memorySequence[taskState.memoryUserIdx]) {
            taskState.memoryUserIdx++;
            if (taskState.memoryUserIdx === taskState.memorySequence.length) nextTask();
        } else {
            if (dom.ringFeedback) dom.ringFeedback.textContent = "Ошибка! Сброс раунда...";
            taskState.step = Math.max(0, taskState.step - 1);
            setTimeout(nextTask, 800);
        }
    };

    grid.addEventListener('click', handleTileClick);
    grid.addEventListener('touchstart', (e) => { e.preventDefault(); handleTileClick(e); });
}

// ============================================
// PAIRS TASK
// ============================================
function renderPairsTask(d) {
    const count = 2 + d;
    const tiles = [];
    const emojis = ['😀', '😂', '🤣', '😍', '😎', '🤔', '😢', '😱'];

    // Create pairs
    const pairedEmojis = [];
    for (let i = 0; i < count; i++) {
        const emoji = emojis[i % emojis.length];
        pairedEmojis.push(emoji, emoji); // Two of each
    }
    // Shuffle
    for (let i = pairedEmojis.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairedEmojis[i], pairedEmojis[j]] = [pairedEmojis[j], pairedEmojis[i]];
    }

    dom.taskBody.innerHTML = `<div class="pairs-grid" id="pairs-grid"></div>`;
    const grid = document.getElementById('pairs-grid');

    pairedEmojis.forEach((emoji, idx) => {
        const tile = document.createElement('div');
        tile.className = `pair-tile${idx < count ? '' : ' hidden'}`;
        tile.dataset.idx = idx;
        tile.dataset.emoji = emoji;
        tile.textContent = emoji;
        tile.addEventListener('click', () => handlePairClick(tile, emoji, idx));
        grid.appendChild(tile);
    });
}

function handlePairClick(tile, emoji, idx) {
    tile.classList.add('matched');
    tile.style.color = 'var(--success)';
    tile.style.pointerEvents = 'none';

    // Check if pair found
    // Simple logic: just advance
    nextTask();
}

// ============================================
// TARGETS TASK
// ============================================
function renderTargetsTask(d) {
    const count = 6 + d; // 6-14 targets
    const arena = document.createElement('div');
    arena.className = 'game-arena';
    arena.innerHTML = ''; // Will populate targets

    // Create targets
    const targetCount = 6 + d;
    for (let i = 0; i < targetCount; i++) {
        const target = document.createElement('div');
        target.className = 'target-node';
        target.dataset.id = i;
        target.textContent = (i + 1);
        // Random position
        const x = Math.random() * (arena.clientWidth - 50);
        const y = Math.random() * (arena.clientHeight - 50);
        target.style.left = `${x}px`;
        target.style.top = `${y}px`;
        target.addEventListener('click', () => handleTargetClick(target));
        arena.appendChild(target);
    }

    dom.taskBody.appendChild(arena);
    dom.taskBody.style.position = 'relative';
    dom.taskBody.style.height = '250px';
}

function handleTargetClick(target) {
    target.style.transform = 'scale(1.2)';
    setTimeout(() => {
        target.style.transform = 'scale(1)';
        // Remove after short time
        target.remove();
        nextTask();
    }, 100);

    // Check if all targets clicked
    const remaining = dom.taskBody.querySelectorAll('.target-node');
    if (remaining.length === 0) {
        // All done
        nextTask();
    }
}

// ============================================
// RIDDLES TASK
// ============================================
function renderRiddlesTask(d) {
    const riddles = [
        {
            question: "Что можно 잡고, но нельзя увидеть?",
            options: ["Руку", "Время", "Стихии", "Голос"],
            answer: 1 // Индекс ответа
        },
        {
            question: "Что имеет ключ, но не может открыть дверь?",
            options: ["Пианино", "Карту", "Банк", "Дверь"],
            answer: 0
        },
        {
            question: "Что стоит на одной ноге, но не ходит?",
            options: ["Стол", "Цветет", "Гора", "Обувь"],
            answer: 0
        }
    ];

    const riddle = riddles[Math.floor(Math.random() * riddles.length)];

    dom.taskBody.innerHTML = `
        <div style="background: var(--surface-card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 20px;">
            <div style="font-weight: 700; font-size: 1.2rem; margin-bottom: 16px; color: white;">${riddle.question}</div>
        </div>
        <div class="riddle-options">
    `;

    riddle.options.forEach((opt, i) => {
        dom.taskBody.innerHTML += `
            <div class="riddle-option" data-index="${i}">
                ${opt}
            </div>
        `;
    });

    dom.taskBody.innerHTML += `</div>`;

    // Add click handlers
    document.querySelectorAll('.riddle-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const selectedIdx = parseInt(opt.dataset.index);
            if (selectedIdx === riddle.answer) {
                nextTask();
            } else {
                if (dom.ringFeedback) dom.ringFeedback.textContent = "Неправильно! Попробуйте еще";
                taskState.step = Math.max(0, taskState.step - 1);
                setTimeout(nextTask, 800);
            }
        });
    });
}

// ============================================
// ODD ONE OUT TASK
// ============================================
function renderOddTask(d) {
    const types = [
        { name: "Числа", values: [1, 2, 3, 7] },
        { name: "Слова", values: ["cat", "dog", "tree", "fish"] },
        { name: "Фигуры", values: ["▲", "●", "■", "△"] }
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const oddIdx = Math.floor(Math.random() * type.values.length);

    dom.taskBody.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <div class="odd-card">${type.values[0]}</div>
            <div class="odd-card">${type.values[1]}</div>
            <div class="odd-card">${type.values[2]}</div>
            <div class="odd-card">${type.values[3]}</div>
        </div>
        <div style="margin-top: 16px; text-align: center; color: var(--text-dim); font-size: 0.9rem;">
            Найдите лишнее
        </div>
    `;

    // Add click handlers
    document.querySelectorAll('.odd-card').forEach(card => {
        card.addEventListener('click', () => {
            const idx = parseInt(card.dataset.index || '0');
            if (idx === oddIdx) {
                nextTask();
            } else {
                if (dom.ringFeedback) dom.ringFeedback.textContent = "Неправильно! Попробуйте еще";
                taskState.step = Math.max(0, taskState.step - 1);
                setTimeout(nextTask, 800);
            }
        });
    });
}

// ============================================
// GENERATOR FUNCTIONS
// ============================================
function genMath(d) {
    if (d === 1) {
        const a = Math.floor(Math.random()*9)+1, b = Math.floor(Math.random()*9)+1;
        return { txt: `${a} + ${b}`, ans: a+b };
    }
    if (d === 2) {
        const a = Math.floor(Math.random()*90)+10, b = Math.floor(Math.random()*90)+10;
        return { txt: `${a} + ${b}`, ans: a+b };
    }
    if (d === 3) {
        const a = Math.floor(Math.random()*12)+2, b = Math.floor(Math.random()*10)+2, c = Math.floor(Math.random()*50)+10;
        return { txt: `${a} × ${b} + ${c}`, ans: a*b+c };
    }
    if (d === 4) {
        const a = Math.floor(Math.random()*20)+10, b = Math.floor(Math.random()*9)+2, c = Math.floor(Math.random()*100)+50;
        return { txt: `${a} × ${b} - ${c}`, ans: a*b-c };
    }
    const a = Math.floor(Math.random()*15)+10, b = Math.floor(Math.random()*15)+5, c = Math.floor(Math.random()*15)+10, d2 = Math.floor(Math.random()*10)+5;
    return { txt: `(${a} × ${b}) + (${c} × ${d2})`, ans: (a*b)+(c*d2) };
}

function genCode(d) {
    const c1 = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    const c2 = "abcdefghijkmnopqrstuvwxyz";
    const c3 = "!@#$%^&*";
    let pool = c1, len = 5;
    if (d >= 3) { pool += c2; len = 8; }
    if (d === 5) { pool += c3; len = 12; }
    let res = "";
    for(let i=0; i<len; i++) res += pool[Math.floor(Math.random()*pool.length)];
    return res;
}

// Export for HTML access
window.genMath = genMath;
window.genCode = genCode;

// Initialize on load
document.addEventListener('DOMContentLoaded', init);