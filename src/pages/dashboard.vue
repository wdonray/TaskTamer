<template>
  <form @submit="createPage">
    <div
      v-if="showAddFolder || !taskTamerPages?.length"
      class="d-flex justify-content-between align-items-center"
    >
      <button
        v-if="taskTamerPages?.length"
        class="btn btn-link btn-sm"
        @click="() => (showAddFolder = false)"
        type="button"
      >
        Cancel
      </button>
      <b>New Folder</b>
      <button
        :disabled="folderExist || !page.name.trim()"
        type="submit"
        class="btn btn-link btn-sm font-bold"
      >
        Submit
      </button>
    </div>

    <div v-else class="d-flex flex-row-reverse">
      <button class="btn btn-link float" @click="() => (showAddFolder = true)">
        <i :class="`bi bi-folder-${showAddFolder ? 'minus' : 'plus'}`"></i>
      </button>
    </div>

    <div class="mt-3" v-if="!taskTamerPages?.length || showAddFolder">
      <input
        type="text"
        class="form-control"
        id="page-name"
        aria-describedby="page-name-help"
        v-model="page.name"
        placeholder="New Folder"
        autofocus
        :maxlength="24"
        autocomplete="off"
      />
    </div>

    <div v-if="!showAddFolder && taskTamerPages?.length">
      <div class="d-flex justify-content-between align-items-center">
        <h2>Folders</h2>
        <button
          type="button"
          class="btn btn-link"
          @click="() => (editMode = !editMode)"
        >
          Edit
        </button>
      </div>
      <hr class="mt-1" />
      <ul class="list-group list-group-flush">
        <li
          v-for="page in taskTamerPages"
          class="list-group-item list-item d-flex justify-content-between align-items-center"
          @mouseover="() => (hovering = page.name)"
          @mouseleave="() => (hovering = undefined)"
          @click="() => navigateToContent(page.name)"
        >
          <div class="fs-6 d-flex align-items-center">
            <i
              v-if="hovering == page.name"
              class="bi bi-folder2-open fw-bold"
            ></i>
            <i v-else class="bi bi-folder2"></i>
            <span class="ms-4"> {{ page.name }} </span>
          </div>
          <div class="d-flex align-items-center">
            <span class="text-muted">{{ page?.tasks.length }}</span>
            <Transition name="fade" mode="out-in">
              <button
                v-if="!editMode"
                class="btn btn-sm navigate-btn"
                :class="{ 'fw-bold': hovering?.name == page.name }"
                type="button"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
              <button
                v-else
                class="btn btn-link text-danger btn-sm"
                @click="() => deletePage(page)"
                type="button"
              >
                <i class="bi bi-trash3"></i>
              </button>
            </Transition>
          </div>
        </li>
      </ul>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const page = reactive({
  name: "",
  tasks: [],
});

const editMode = ref(false);
const showAddFolder = ref(false);
const taskTamerPages = ref(undefined);
const hovering = ref(undefined);

const folderExist = computed(() =>
  taskTamerPages.value.some((item) => item.name == page.name)
);

function generatePages() {
  localStorage.setItem("tasktamer.pages", JSON.stringify([page]));
  loadPages();
}

function loadPages() {
  const folders = JSON.parse(localStorage.getItem("tasktamer.pages")) ?? [];
  taskTamerPages.value = folders;
}

function createPage(event) {
  if (event) event.preventDefault();

  if (localStorage.getItem("tasktamer.pages") == null) {
    generatePages();
    return;
  }

  loadPages();
  taskTamerPages.value.push({ ...page });
  localStorage.setItem("tasktamer.pages", JSON.stringify(taskTamerPages.value));

  showAddFolder.value = false;
  editMode.value = false;

  navigateToContent(page.name);
}

function deletePage(page) {
  taskTamerPages.value = taskTamerPages.value.filter(
    (taskTamerPage) => taskTamerPage.name != page.name
  );

  localStorage.setItem("tasktamer.pages", JSON.stringify(taskTamerPages.value));
}

function navigateToContent(pageName) {
  if (editMode.value) return;
  router.push({ path: "/content", query: { pageName } });
}

loadPages();
</script>

<style scoped>
form {
  cursor: pointer;
}
</style>
