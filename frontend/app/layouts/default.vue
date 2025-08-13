<template>
  <div class="app-layout">
    <MainNavbar />
    
    <main class="main-content">
      <slot />
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Legal Docs</h3>
          <p>Your trusted source for legal documents and insights.</p>
        </div>

        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <NuxtLink to="/documents">Documents</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/blog">Blog</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/auth/login">Log In</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/auth/register">Sign Up</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>Legal</h4>
          <ul>
            <li>
              <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/terms">Terms of Service</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>Contact</h4>
          <ul>
            <li>
              <a href="mailto:support@example.com">support@example.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© {{ currentYear }} Legal Docs. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MainNavbar from '@/components/navigation/MainNavbar.vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.app-footer {
  background: var(--footer-bg, #1a1a1a);
  color: white;
  padding: 4rem 2rem 2rem;
  margin-top: 4rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-section h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.footer-section h4 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: white;
}

.footer-section p {
  color: var(--footer-text, #e0e0e0);
  margin-bottom: 1rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: var(--footer-text, #e0e0e0);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-section ul li a:hover {
  color: var(--primary-color);
}

.footer-bottom {
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid var(--footer-border, #333);
  text-align: center;
  color: var(--footer-text, #e0e0e0);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-section {
    text-align: center;
  }
}
</style>