<template>
  <div class="flex-container">
    <main class="main">
      <router-view></router-view>
    </main>
    <footer class="footer">
      <img class="logo" :src="logo" />
      <b class="lead">TaskTamer</b>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import logo from "./assets/128.png";

const router = useRouter();

router.push("/");
</script>
