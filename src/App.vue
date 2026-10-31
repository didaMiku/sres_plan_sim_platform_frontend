<script setup lang="ts"></script>

<template>
  <div class="edge edge-top" aria-hidden="true"><i></i><i></i><i></i></div>
  <router-view />
  <div class="edge edge-bottom" aria-hidden="true"><i></i><i></i><i></i></div>
</template>

<style>
@font-face {
  font-family: 'Jost';
  font-style: normal;
  font-weight: 100 900;
  font-display: block;
  src: url('/fonts/jost-latin.woff2') format('woff2');
}
@font-face {
  font-family: 'Jost';
  font-style: normal;
  font-weight: 100 900;
  font-display: block;
  src: url('/fonts/jost-latin-ext.woff2') format('woff2');
}

:root {
  --paper: #f2ebdc;
  --paper-hi: #faf6e8;
  --paper-lo: #e3d9c2;
  --ink: #1a1a18;
  --ink-2: #2c2b27;
  --ink-3: #4a4842;
  --ink-4: #8c887c;
  --red: #a03224;
  --amber: #f5a634;
  --teal: #7db8ad;
  --ochre: #c08a35;
  --sage: #7c9784;
  --terracotta: #c1663f;
  --brick: #8e2e22;
  --rule: rgba(26, 26, 24, 0.22);
  --f-display: 'Jost', 'Futura', 'Century Gothic', sans-serif;
  --f-tech: 'Jost', 'Bahnschrift', 'DIN Alternate', sans-serif;
  --f-zh: 'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

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
  background: var(--paper);
  color: var(--ink);
  font-family: var(--f-zh);
  font-size: 14px;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9000;
  pointer-events: none;
  opacity: 0.16;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.30'/%3E%3C/svg%3E");
}

a {
  color: var(--red);
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: var(--f-tech);
  font-size: 12px;
  letter-spacing: 0.08em;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  border-radius: 0;
  padding: 8px 14px;
  transition: background 0.25s, color 0.25s;
}

button:hover {
  background: var(--ink);
  color: var(--paper);
}

button.primary {
  background: var(--amber);
  border-color: var(--ink);
  color: var(--ink);
}

button.primary:hover {
  background: var(--ink);
  color: var(--amber);
}

button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

input {
  font: inherit;
  background: var(--paper-hi);
  border: 1px solid var(--ink);
  color: var(--ink);
  border-radius: 0;
  padding: 9px 12px;
  width: 100%;
}

input:focus {
  outline: none;
  border-color: var(--amber);
  box-shadow: 0 0 0 2px rgba(245, 166, 52, 0.25);
}

.card {
  background: var(--paper-hi);
  border: 1px solid var(--rule);
  border-radius: 0;
}

.muted {
  color: var(--ink-4);
}

.edge {
  position: fixed;
  left: 0;
  right: 0;
  height: 6px;
  display: flex;
  z-index: 9999;
  pointer-events: none;
}

.edge-top {
  top: 0;
}

.edge-bottom {
  bottom: 0;
}

.edge i {
  display: block;
  height: 100%;
}

.edge i:nth-child(1) {
  background: var(--red);
  flex: 1.06;
}

.edge i:nth-child(2) {
  background: var(--amber);
  flex: 1.24;
}

.edge i:nth-child(3) {
  background: var(--teal);
  flex: 1;
}
</style>
