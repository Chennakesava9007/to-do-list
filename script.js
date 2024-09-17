let tasks = [];
let currentUser = null;

// Authentication Functions
function showRegister() {
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}

function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    if (localStorage.getItem(username)) {
        alert('Username already exists.');
    } else {
        localStorage.setItem(username, password);
        alert('Registration successful! You can now log in.');
        showLogin();
    }
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const storedPassword = localStorage.getItem(username);
    if (storedPassword === password) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        loadTasks();
        requestNotificationPermission();
    } else {
        alert('Invalid username or password.');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
    document.getElementById('tasks').innerHTML = ''; // Clear tasks on logout
}

// Task Management Functions
function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskDue = document.getElementById('task-due').value;
    const taskCategory = document.getElementById('task-category').value;
    const taskPriority = document.getElementById('task-priority').value;
    const taskText = taskInput.value;
    
    if (taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            dueDate: taskDue ? new Date(taskDue).toISOString() : null,
            category: taskCategory,
            priority: taskPriority
        };
        tasks.push(task);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        document.getElementById('task-due').value = '';
        scheduleNotifications();
    }
}

function saveTasks() {
    if (currentUser) {
        localStorage.setItem(`tasks-${currentUser}`, JSON.stringify(tasks));
    }
}

function loadTasks() {
    const savedTasks = localStorage.getItem(`tasks-${currentUser}`);
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
        scheduleNotifications();
    }
}

function renderTasks() {
    const taskList = document.getElementById('tasks');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date';
        const li = document.createElement('li');
        li.innerHTML = `
            <span style="text-decoration: ${task.completed ? 'line-through' : 'none'}">${task.text}</span>
            <span>Due: ${dueDate}</span>
            <span>Category: ${task.category}</span>
            <span>Priority: ${task.priority}</span>
            <button onclick="editTask(${task.id}, prompt('Edit task:', '${task.text}'))">Edit</button>
            <button onclick="toggleTaskCompletion(${task.id})">${task.completed ? 'Unmark' : 'Complete'}</button>
            <button onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

function toggleTaskCompletion(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Notification Functions
function requestNotificationPermission() {
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            } else {
                console.log('Notification permission denied.');
            }
        });
    }
}

function scheduleNotifications() {
    const now = new Date();
    tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate - now;
            if (timeDiff > 0) {
                setTimeout(() => {
                    if (Notification.permission === 'granted') {
                        new Notification('Task Reminder', {
                            body: `Your task "${task.text}" is due now!`,
                            icon: 'notification_icon.png'
                        });
                    }
                    alert(`Reminder: Your task "${task.text}" is due now!`);
                }, timeDiff);
            }
        }
    });
}

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        loadTasks();
        requestNotificationPermission();
    } else {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
    }
});

// Dark Mode Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}
