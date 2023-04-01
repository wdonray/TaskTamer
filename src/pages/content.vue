<template>
  <Modal
    :open="showModal"
    :selected-type="selectedType"
    @close="closeModal"
    @submit="handleModalSubmit"
  />
  <form @submit.prevent="createTask">
    <div class="d-flex justify-content-between header pb-2">
      <button
        type="button"
        class="btn btn-link p-0"
        @click="() => router.push('/')"
      >
        <i class="bi bi-chevron-left"></i>
      </button>
    </div>
    <h2>{{ pageName }}</h2>
    <div>
      <div class="d-flex justify-content-between align-items-center">
        <b>Task</b>
        <button
          type="button"
          class="btn btn-link"
          @click="() => (editMode = !editMode)"
        >
          Edit
        </button>
      </div>
      <hr class="mt-1" />
      <div class="input-wrapper">
        <input
          type="text"
          id="task-name"
          aria-describedby="task-name-help"
          v-model="task.name"
          placeholder="New Task"
          autocomplete="off"
        />
        <span class="border"></span>
        <span class="border"></span>
        <span class="border"></span>
        <span class="border"></span>
      </div>
      <ul class="list-group list-group-flush">
        <span v-if="!tasks.length" class="text-body mx-auto mt-4 d-flex">
          <div class="slow-bounce"><i class="bi bi-arrow-up"></i></div>
          No task found, create some.
          <div class="slow-bounce"><i class="bi bi-arrow-up"></i></div>
        </span>
        <li
          v-else
          v-for="t in tasks"
          class="list-group-item d-flex flex-column"
        >
          <div class="content align-items-center gap-2">
            <input
              class="form-check-input m-0 checkbox"
              type="checkbox"
              v-model="t.completed"
              @change="updateFolder"
            />

            <div class="list-item" @click="() => handleTaskClick(t)">
              <span
                :class="`user-select-none ${
                  (t.completed && 'text-decoration-line-through opacity-50') ||
                  (selected?.id == t.id && !t.completed && 'fw-bold')
                }`"
              >
                {{ t.name }}
              </span>
            </div>
            <Transition name="fade" mode="out-in">
              <button
                v-if="editMode"
                type="button"
                class="btn btn-link text-danger btn-sm p-0 trash-can"
                @click="() => deleteTask(t)"
              >
                <i class="bi bi-trash3"></i>
              </button>
            </Transition>
          </div>
          <div v-if="t.date" class="ms-auto">
            <span
              :class="
                (t.completed && 'text-decoration-line-through opacity-50') ||
                (new Date(t.date) < new Date() && 'text-danger')
              "
              class="fw-bold p-1 text-center rounded date"
            >
              {{ addOneDay(new Date(t.date)).toLocaleDateString("en-US") }}
            </span>
          </div>
          <div v-if="selected?.id == t.id" class="task-edit-area mt-2">
            <button
              type="button"
              class="btn btn-link"
              @click="() => openModel('rename')"
            >
              Rename <i class="bi bi-pencil-square"></i>
            </button>
            <button
              type="button"
              class="btn btn-link"
              @click="() => openModel('change-date')"
            >
              Change Date <i class="bi bi-calendar"></i>
            </button>
            <button
              type="button"
              class="btn btn-link"
              @click="() => openModel('move-location')"
            >
              Move location <i class="bi bi-folder2"></i>
            </button>
          </div>
        </li>
      </ul>
      <button type="submit" class="d-none"></button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import Modal from "../components/Modal.vue";

const router = useRouter();

const { pageName } = router.currentRoute.value.query;

const task = reactive({
  id: uuidv4(),
  name: "",
  completed: false,
  date: undefined,
});

const editMode = ref(false);
const tasks = ref(undefined);
const selected = ref(undefined);
const selectedType = ref(undefined);
const showModal = ref(false);

const modalSubmit = {
  rename: (v) => updateTask("name", v),
  "change-date": (v) => updateTask("date", new Date(v)),
  "move-location": (v) => moveFolder(v),
};

function loadTasks() {
  const folder = JSON.parse(localStorage.getItem("tasktamer.pages")) ?? [];

  if (!folder.length) {
    router.push("/");
    return;
  }

  tasks.value = folder.find((page) => page.name === pageName).tasks;
}

function updateFolder() {
  const folders = JSON.parse(localStorage.getItem("tasktamer.pages"));
  const index = folders.findIndex((folder) => folder.name == pageName);

  folders[index].tasks = tasks.value;
  task.name = "";
  task.id = uuidv4();
  localStorage.setItem("tasktamer.pages", JSON.stringify(folders));
}

function createTask() {
  tasks.value.push({ ...task });
  updateFolder();
}

function updateTask(key, v) {
  tasks.value = tasks.value.map((item) => {
    if (item.id == selected.value.id) {
      return { ...selected.value, [key]: v };
    }

    return item;
  });

  updateFolder();
}

function moveFolder(v) {
  const folders = JSON.parse(localStorage.getItem("tasktamer.pages"));
  const sourceIndex = folders.findIndex((folder) => folder.name == pageName);
  const destinationIndex = folders.findIndex((folder) => folder.name == v);

  folders[destinationIndex].tasks = [
    ...folders[destinationIndex].tasks,
    selected.value,
  ];

  tasks.value = tasks.value.filter((task) => task.id != selected.value.id);

  folders[sourceIndex].tasks = tasks.value;

  selected.value = undefined;

  localStorage.setItem("tasktamer.pages", JSON.stringify(folders));
}

function deleteTask(task) {
  tasks.value = tasks.value.filter((item) => item.id != task.id);
  updateFolder();
}

function handleTaskClick(task) {
  if (task.completed) return;

  if (selected.value?.id == task.id) {
    selected.value = undefined;
    return;
  }

  selected.value = task;
}

function openModel(type) {
  showModal.value = true;
  selectedType.value = type;
}

function closeModal() {
  showModal.value = false;
  selectedType.value = undefined;
}

function addOneDay(date) {
  date.setDate(date.getDate() + 1);
  return date;
}

function handleModalSubmit(data) {
  const { type, value } = data;
  modalSubmit[type](value);
}

loadTasks();
</script>

<style scoped>
.header {
  position: relative;
}

.header .btn {
  color: #1a98ff;
}

.input-wrapper {
  position: relative;
  margin-bottom: 10px;
}

.input-wrapper input {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 5px 15px;
  color: white;
  border: none;
  background-color: transparent;
  box-sizing: border-box;
}

.border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid #fff;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
}

.input-wrapper input:focus ~ .border {
  border-color: #ffa500;
}

.input-wrapper input:not(:placeholder-shown) + label {
  top: -8px;
  font-size: 12px;
}

.input-wrapper input:not(:placeholder-shown) ~ .border {
  border-color: #fff;
}

.task-edit-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.task-edit-area .btn {
  font-size: 12px;
  color: black;
  padding: 0;
  text-align: start;
}

.task-edit-area .btn > *:first-child {
  margin-left: 0.5rem;
}

.date {
  font-size: 10px;
}

.content {
  font-size: 12px;
  position: relative;
  display: grid;
  grid-template-columns: 0.2fr 3fr 0.1fr;
}

.trash-can {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.checkbox {
  cursor: pointer;
}
</style>
