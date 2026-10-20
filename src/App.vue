<script setup lang="ts"></script>

<template>
  <router-view />
</template>

<style>
/* 全局暗色主题：朴素但能看 */
* {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  min-height: 100vh;
}

body {
  background: #0b1220;
  color: #dbe3f0;
  font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', system-ui, sans-serif;
  font-size: 14px;
}

a {
  color: #5ee0c0;
  text-decoration: none;
}

button {
  cursor: pointer;
  font: inherit;
  border: 1px solid #2a3a55;
  background: #16233a;
  color: #dbe3f0;
  border-radius: 6px;
  padding: 8px 14px;
}

button:hover {
  border-color: #4a6a95;
}

button.primary {
  background: #1d6f5c;
  border-color: #2aa387;
}

button.primary:hover {
  background: #23836d;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input {
  font: inherit;
  background: #0f1a2c;
  border: 1px solid #2a3a55;
  color: #dbe3f0;
  border-radius: 6px;
  padding: 9px 12px;
  width: 100%;
}

input:focus {
  outline: none;
  border-color: #2aa387;
}

.card {
  background: #101c30;
  border: 1px solid #1f2f47;
  border-radius: 10px;
}

.muted {
  color: #7f90aa;
}
</style>
