<template>
  <div>
    <nav class="navigation">
      <NuxtLink to="/" class="nav-link">Графики</NuxtLink>
      <NuxtLink to="/database" class="nav-link">База данных</NuxtLink>
    </nav>
    <NuxtPage />
  </div>
</template>

<style>
:root {
  --app-background: #f5f7fa;
  --card-background: rgba(255, 255, 255, 0.95);
  --blur-background: rgba(247, 248, 249, 0.7);
  --text-primary: #1d1d1f;
  --text-secondary: #86868b;
  --accent-color: #007aff;
  --accent-gradient: linear-gradient(135deg, #007aff, #5856d6);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
}

body {
  margin: 0;
  padding: 0;
  background: var(--app-background);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  -webkit-font-smoothing: antialiased;
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
  padding: 16px 24px;
  background: var(--card-background);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 16px;
}

.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  background: rgba(0, 0, 0, 0.05);
}

.nav-link.router-link-active {
  background: var(--accent-color);
  color: white;
}
</style>
