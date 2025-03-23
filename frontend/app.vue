<template>
  <div>
    <nav class="navigation">
      <NuxtLink to="/" class="nav-link">Главная</NuxtLink>
      <NuxtLink to="/database" class="nav-link">База данных</NuxtLink>
    </nav>
    <NuxtPage />
  </div>
</template>

<style>
:root {
  --app-background: #0b0e11;
  --card-background: #1a1d20;
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --accent-color: #02c076;
  --accent-negative: #f6465d;
  --border-color: rgba(255, 255, 255, 0.1);
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--app-background);
  color: var(--text-primary);
}

.app-container {
  min-height: 100vh;
  padding: 20px;
}

h1 {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 24px 0 40px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 20px;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.navigation {
  display: flex;
  gap: 16px;
  padding: 16px 24px;
  background: var(--card-background);
  border-bottom: 1px solid var(--border-color);
}

.nav-link {
  text-decoration: none;
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background: var(--accent-color);
  color: white;
}
</style>
