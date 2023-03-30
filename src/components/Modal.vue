<template>
  <form
    v-if="open"
    class="c-modal"
    @click="modalClick"
    @submit.prevent="submitForm"
  >
    <div class="c-modal-content">
      <div class="c-modal-header">
        <h4 class="user-select-none">{{ header }}</h4>
        <i class="bi bi-x-lg" @click="() => emit('close')"></i>
      </div>
      <div v-if="selectedType == 'move-location'">
        <select
          class="form-select"
          :disabled="!filteredFolders.length"
          v-model="inputValue"
        >
          <option disabled selected value>
            {{
              filteredFolders.length
                ? "-- select another location --"
                : "-- no other locations --"
            }}
          </option>
          <option
            v-for="folder in filteredFolders"
            v-key="folder.name"
            :value="folder.name"
          >
            {{ folder.name }}
          </option>
        </select>
      </div>
      <div v-else class="input-group">
        <input
          class="w-100 input-group-text"
          :type="inputType"
          v-model="inputValue"
          autofocus
          autocomplete="off"
        />
      </div>
      <span v-if="tooltip" class="c-tooltiptext">{{ tooltip }}</span>
      <div class="c-modal-footer">
        <button
          type="button"
          class="btn btn-sm btn-secondary"
          @click="() => emit('close')"
        >
          Cancel
        </button>
        <button
          :disabled="isSubmitDisabled"
          type="submit"
          class="btn btn-sm btn-primary"
        >
          Submit
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, toRef, watch, computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  selectedType: {
    type: String,
    required: true,
  },
});

const router = useRouter();

const { pageName } = router.currentRoute.value.query;

const folders = JSON.parse(localStorage.getItem("tasktamer.pages"));
const filteredFolders = folders.filter((folder) => folder.name != pageName);

const emit = defineEmits(["close", "submit"]);

const isOpen = toRef(props, "open");

const header = ref("");
const inputValue = ref("");

const headers = {
  rename: "Rename task",
  "change-date": "Update date",
  "move-location": "Move folder location",
  tags: "Update tags",
};

function modalClick(event) {
  const { className } = event.target;
  if (className != "c-modal") return;

  emit("close");
}

function submitForm() {
  emit("submit", {
    type: props.selectedType,
    value: inputValue.value,
  });
  emit("close");
  inputValue.value = "";
}

watch(isOpen, (newValue) => {
  if (!newValue) return;

  header.value = headers[props.selectedType];
});

const inputType = computed(() => {
  if (props.selectedType == "change-date") return "date";
  return "text";
});

const tooltip = computed(() => {
  if (props.selectedType == "change-date")
    return "Date must not be in the past.";
  if (props.selectedType == "tags") return "Seperate each tag with a comma.";

  return undefined;
});

const isSubmitDisabled = computed(() => {
  if (!inputValue.value.trim()) return true;

  if (props.selectedType == "change-date") {
    return new Date(inputValue.value) < new Date();
  }

  return false;
});
</script>

<style scoped>
.c-modal {
  position: fixed;
  z-index: 999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.c-modal-content {
  color: black;
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;

  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.c-modal-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.c-modal-header i {
  cursor: pointer;
}

.c-modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: end;
}

.c-close {
  color: #aaaaaa;
  font-size: 28px;
  font-weight: bold;
}

.c-close:hover,
.c-close:focus {
  color: #000;
  text-decoration: none;
  cursor: pointer;
}

.c-tooltiptext {
  font-size: 10px;
  color: black;
  text-align: center;
  margin: auto;
  font-style: italic;
}

.input-group-text {
  text-align: start;
}
</style>
