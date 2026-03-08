(() => {
  const STORAGE_KEY = 'todo_tasks';

  // DOM 引用
  const taskInput   = document.getElementById('taskInput');
  const addBtn      = document.getElementById('addBtn');
  const taskList    = document.getElementById('taskList');
  const emptyState  = document.getElementById('emptyState');
  const bottomBar   = document.getElementById('bottomBar');
  const clearDoneBtn= document.getElementById('clearDoneBtn');
  const dateLabel   = document.getElementById('dateLabel');
  const tabs        = document.querySelectorAll('.tab');

  const totalCountEl   = document.getElementById('totalCount');
  const pendingCountEl = document.getElementById('pendingCount');
  const doneCountEl    = document.getElementById('doneCount');

  let tasks  = [];
  let filter = 'all';

  // ===== 初始化 =====
  function init() {
    setDateLabel();
    loadTasks();
    render();
  }

  function setDateLabel() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    dateLabel.textContent = now.toLocaleDateString('zh-CN', options);
  }

  // ===== 本地存储 =====
  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function loadTasks() {
    try {
      tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      tasks = [];
    }
  }

  // ===== 任务操作 =====
  function addTask(text) {
    text = text.trim();
    if (!text) return;
    tasks.unshift({ id: Date.now(), text, done: false });
    saveTasks();
    render();
    taskInput.value = '';
  }

  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.done = !task.done;
      saveTasks();
      render();
    }
  }

  function deleteTask(id) {
    const li = document.querySelector(`[data-id="${id}"]`);
    if (li) {
      li.classList.add('removing');
      li.addEventListener('animationend', () => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        render();
      }, { once: true });
    }
  }

  function clearDone() {
    tasks = tasks.filter(t => !t.done);
    saveTasks();
    render();
  }

  // ===== 渲染 =====
  function render() {
    updateStats();

    const filtered = tasks.filter(t => {
      if (filter === 'pending') return !t.done;
      if (filter === 'done')    return t.done;
      return true;
    });

    // 清空列表（保留 emptyState）
    Array.from(taskList.querySelectorAll('.task-item')).forEach(el => el.remove());

    if (filtered.length === 0) {
      emptyState.style.display = 'flex';
    } else {
      emptyState.style.display = 'none';
      filtered.forEach(task => taskList.appendChild(createTaskEl(task)));
    }

    const hasDone = tasks.some(t => t.done);
    bottomBar.style.display = hasDone ? 'block' : 'none';
  }

  function createTaskEl(task) {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    const checkbox = document.createElement('div');
    checkbox.className = `checkbox${task.done ? ' checked' : ''}`;
    checkbox.title = task.done ? '标记为未完成' : '标记为完成';
    checkbox.addEventListener('click', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.title = '删除';
    delBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
      </svg>`;
    delBtn.addEventListener('click', () => deleteTask(task.id));

    li.append(checkbox, span, delBtn);
    return li;
  }

  function updateStats() {
    const total   = tasks.length;
    const done    = tasks.filter(t => t.done).length;
    const pending = total - done;
    totalCountEl.textContent   = total;
    pendingCountEl.textContent = pending;
    doneCountEl.textContent    = done;
  }

  // ===== 事件绑定 =====
  addBtn.addEventListener('click', () => addTask(taskInput.value));

  taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask(taskInput.value);
  });

  clearDoneBtn.addEventListener('click', clearDone);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filter = tab.dataset.filter;
      render();
    });
  });

  init();
})();
