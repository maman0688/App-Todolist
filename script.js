let currentFilter = 'all';

document.getElementById('toggleDark').onclick = () => {
  document.body.classList.toggle('dark');
};

function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const deadlineInput = document.getElementById('deadlineInput');
  const text = taskInput.value.trim();
  const deadline = deadlineInput.value;

  if (text === '') return;

  const tasks = getTasks();
  tasks.push({ text, done: false, deadline: deadline || null });
  saveTasks(tasks);

  taskInput.value = '';
  deadlineInput.value = '';
  renderTasks();
  updateProgress();
}

function toggleDone(index) {
  const tasks = getTasks();
  tasks[index].done = !tasks[index].done;
  saveTasks(tasks);
  renderTasks();
  updateProgress();
}

function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
  updateProgress();
}

function filterTasks(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-section button').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.querySelector(`.filter-section button[onclick*="${filter}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  renderTasks();
}

function renderTasks() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const tasks = getTasks();
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    if (
      (currentFilter === 'active' && task.done) ||
      (currentFilter === 'done' && !task.done) ||
      !task.text.toLowerCase().includes(keyword)
    ) return;

    const li = document.createElement("li");
    if (task.done) li.classList.add("done");

    // Format deadline
    let deadlineHTML = '';
    if (task.deadline) {
      const status = getDeadlineStatus(task.deadline);
      deadlineHTML = `<small class="deadline ${status}">📅 ${task.deadline}</small>`;
    }

    li.innerHTML = `
      <div class="task-content" onclick="toggleDone(${index})">
        <span>${task.text}</span>
        ${deadlineHTML}
      </div>
      <div class="task-actions">
        <button onclick="editTask(${index})"><i class="fa-solid fa-pen-to-square"></i></button>
        <button onclick="deleteTask(${index})"><i class="fa-solid fa-xmark"></i></button>
      </div>
    `;
    taskList.appendChild(li);
  });

  updateProgress();
}

function searchTasks() {
  renderTasks();
}

function updateProgress() {
  const tasks = getTasks();
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const percent = total > 0 ? (done / total) * 100 : 0;

  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressText").innerText = `${done}/${total} selesai`;
}

function loadTasks() {
  renderTasks();
  updateProgress();
  checkTodayDeadlines();
}

function getDeadlineStatus(dateStr) {
  if (!dateStr) return ''; // Jika tidak ada deadline

  const now = new Date();
  const deadline = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compare = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

  if (compare < today) return 'overdue'; // Lewat deadline
  if (compare.getTime() === today.getTime()) return 'due-today'; // Deadline hari ini
  return ''; // Deadline di masa depan
}

// 🚨 Optional: Notifikasi ringan untuk tugas yang deadline hari ini
function checkTodayDeadlines() {
  const tasks = getTasks();
  const todayTasks = tasks.filter(task =>
    task.deadline && !task.done && getDeadlineStatus(task.deadline) === 'due-today'
  );

  if (todayTasks.length > 0) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = `🔔 Kamu punya ${todayTasks.length} tugas yang deadline-nya hari ini!`;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 15000); // Remove after 5 seconds
  }
}

function sortByDeadline() {
  const tasks = getTasks();

  tasks.sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  saveTasks(tasks);
  renderTasks();

  // Tambahkan class active ke tombol Deadline Terdekat
  document.querySelectorAll(".filter-section button").forEach(btn => {
    btn.classList.remove("active");
  });

  // Ambil tombol terakhir (Deadline Terdekat) dan tambahkan class active
  const deadlineBtn = document.querySelector(".filter-section button:last-child");
  deadlineBtn.classList.add("active");
}


function editTask(index) {
  const tasks = getTasks();
  const task = tasks[index];

  const newText = prompt("Ubah tugas:", task.text);
  if (newText === null || newText.trim() === '') return;

  const newDeadline = prompt("Ubah deadline (YYYY-MM-DD):", task.deadline || '');
  if (newDeadline !== null) {
    task.text = newText.trim();
    task.deadline = newDeadline || null;
    saveTasks(tasks);
    renderTasks();
    updateProgress();
  }
}

window.onload = loadTasks;
