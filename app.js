(() => {
  const STORAGE_KEY = "daymark.tasks.v1";
  const filters = {
    all: { title: "All tasks", subtitle: "Everything you want to get done." },
    active: { title: "To do", subtitle: "One step at a time. You've got this." },
    completed: { title: "Completed", subtitle: "Look at everything you've accomplished." },
  };

  const elements = {
    form: document.querySelector("#task-form"),
    title: document.querySelector("#task-title"),
    description: document.querySelector("#task-description"),
    list: document.querySelector("#task-list"),
    empty: document.querySelector("#empty-state"),
    emptyTitle: document.querySelector("#empty-title"),
    emptyCopy: document.querySelector("#empty-copy"),
    search: document.querySelector("#search-input"),
    listTitle: document.querySelector("#list-title"),
    listSubtitle: document.querySelector("#list-subtitle"),
    visibleCount: document.querySelector("#visible-count"),
    footerCount: document.querySelector("#footer-count"),
    clearCompleted: document.querySelector("#clear-completed"),
    progressRing: document.querySelector("#progress-ring"),
    progressNumber: document.querySelector("#progress-number"),
    progressTitle: document.querySelector("#progress-title"),
    progressSubtitle: document.querySelector("#progress-subtitle"),
    today: document.querySelector("#today-label"),
  };

  let tasks = readTasks();
  let currentFilter = "all";

  function readTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved.filter((task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.description === "string" &&
        typeof task.completed === "boolean" &&
        typeof task.createdAt === "string"
      );
    } catch (error) {
      console.error("Unable to load saved tasks:", error);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Unable to save tasks:", error);
      window.alert("Your changes could not be saved on this device. Check your browser storage settings.");
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Added recently";
    return `Added ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date)}`;
  }

  function makeButton(label, className, text, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);
    button.textContent = text;
    button.addEventListener("click", handler);
    return button;
  }

  function renderTask(task) {
    const item = document.createElement("article");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const toggle = makeButton(
      task.completed ? `Mark "${task.title}" as to do` : `Complete "${task.title}"`,
      "task-toggle",
      "✓",
      () => {
        updateTask(task.id, { completed: !task.completed });
      },
    );
    toggle.setAttribute("aria-pressed", String(task.completed));
    item.append(toggle);

    const copy = document.createElement("div");
    copy.className = "task-copy";
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    copy.append(title);

    if (task.description) {
      const description = document.createElement("p");
      description.className = "task-description";
      description.textContent = task.description;
      copy.append(description);
    }

    const date = document.createElement("span");
    date.className = "task-meta";
    date.textContent = formatDate(task.createdAt);
    copy.append(date);
    item.append(copy);

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.append(makeButton(`Edit "${task.title}"`, "task-action", "✎", () => editTask(task)));
    actions.append(makeButton(`Delete "${task.title}"`, "task-action delete", "×", () => deleteTask(task.id)));
    item.append(actions);
    return item;
  }

  function render() {
    const completed = tasks.filter((task) => task.completed).length;
    const active = tasks.length - completed;
    const percentage = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    document.querySelector("#all-count").textContent = String(tasks.length);
    document.querySelector("#active-count").textContent = String(active);
    document.querySelector("#completed-count").textContent = String(completed);

    elements.progressNumber.textContent = `${percentage}%`;
    elements.progressRing.style.background = `conic-gradient(var(--green) ${percentage}%, #e9eae3 ${percentage}%)`;
    elements.progressRing.setAttribute("aria-label", `${percentage}% of tasks complete`);
    elements.progressTitle.textContent = tasks.length === 0
      ? "Your day, your pace."
      : active === 0 ? "Look at you go!" : `${active} ${active === 1 ? "thing" : "things"} left to do.`;
    elements.progressSubtitle.textContent = tasks.length === 0
      ? "Add a task to get started."
      : `${completed} of ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} complete`;

    const selectedFilter = filters[currentFilter];
    elements.listTitle.firstChild.textContent = selectedFilter.title;
    elements.listSubtitle.textContent = selectedFilter.subtitle;

    const query = elements.search.value.trim().toLocaleLowerCase();
    const visibleTasks = tasks.filter((task) => {
      const matchesFilter = currentFilter === "all" ||
        (currentFilter === "active" && !task.completed) ||
        (currentFilter === "completed" && task.completed);
      const searchable = `${task.title} ${task.description}`.toLocaleLowerCase();
      return matchesFilter && searchable.includes(query);
    });

    elements.list.replaceChildren(...visibleTasks.map(renderTask));
    elements.visibleCount.textContent = String(visibleTasks.length);
    elements.footerCount.textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"}`;
    elements.clearCompleted.hidden = completed === 0;
    elements.empty.hidden = visibleTasks.length > 0;

    if (tasks.length === 0) {
      elements.emptyTitle.textContent = "A fresh start.";
      elements.emptyCopy.textContent = "Add your first task above and make today yours.";
    } else if (visibleTasks.length === 0 && query) {
      elements.emptyTitle.textContent = "No matches yet.";
      elements.emptyCopy.textContent = "Try another search or clear the search field.";
    } else if (currentFilter === "active") {
      elements.emptyTitle.textContent = "All caught up.";
      elements.emptyCopy.textContent = "You’ve completed everything on your list.";
    } else if (currentFilter === "completed") {
      elements.emptyTitle.textContent = "Nothing completed just yet.";
      elements.emptyCopy.textContent = "Your finished tasks will show up here.";
    } else {
      elements.emptyTitle.textContent = "No tasks found.";
      elements.emptyCopy.textContent = "Try another search or add a task above.";
    }
  }

  function addTask(title, description = "") {
    tasks.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    });
    saveTasks();
    render();
  }

  function updateTask(id, changes) {
    tasks = tasks.map((task) => task.id === id ? { ...task, ...changes } : task);
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    render();
  }

  function editTask(task) {
    const title = window.prompt("Edit task title:", task.title);
    if (title === null) return;
    const nextTitle = title.trim();
    if (!nextTitle) {
      window.alert("A task needs a title.");
      return;
    }
    const description = window.prompt("Edit task note (optional):", task.description);
    if (description === null) return;
    updateTask(task.id, { title: nextTitle, description: description.trim() });
  }

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = elements.title.value.trim();
    if (!title) {
      elements.title.focus();
      return;
    }
    addTask(title, elements.description.value);
    elements.form.reset();
    elements.description.value = "";
    elements.title.focus();
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((navButton) => {
        const selected = navButton === button;
        navButton.classList.toggle("active", selected);
        navButton.setAttribute("aria-current", selected ? "page" : "false");
      });
      render();
    });
  });

  elements.search.addEventListener("input", render);
  elements.clearCompleted.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    render();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      elements.search.focus();
    }
  });

  elements.today.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());
  render();
})();
