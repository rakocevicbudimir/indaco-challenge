Build a responsive, maintainable web application mini-prototype using Vue.js 3 and Nuxt.js 3/4. This prototype will mimic a simplified legal document explorer integrated with a blogging platform.

Important Backend Clarification
You are required to roll out your own backend (mock, minimal, or otherwise) to serve document and blog data. This backend can be as simple or as advanced as you like (Laravel, Node.js/Express, JSON-server, static HTTP, etc). It does not need to be production-grade or complex, as the main focus is your client-side (consumer) logic and integration skills.
This demonstrates your ability to integrate with custom APIs, regardless of the backend stack.

Core Application Requirements:
Backend Note: You must roll out your own backend to support all dynamic features below—including but not limited to legal documents, blogs, user management, and cross-referencing. The goal is to show how you consume and integrate with APIs of your own design, not to assess backend engineering.
Legal Documents Section 
Support efficient filtering and searching of legal documents by category, keywords, and any other relevant metadata (e.g., tags, author, date). 
 Provide a detailed document view that displays all essential metadata: title, date, categories/tags, and the full document content (HTML or Markdown, with formatting preserved). 
Context: In legal tech, documents are often broken down to the line or article level, where each line or clause can be an entity, linked to previous versions (think git diffs) or external references. While you are not expected to implement this granularity here, it’s a useful concept to keep in mind when designing your data model or considering future extensibility.
Blog Section
Prioritize design and form: display visually engaging, editorial-style blog articles (think Medium, daily.dev, etc), focusing on clean layout, appealing typography, and modern presentation.
Support rich HTML content with clear, user-friendly design, paying special attention to white space, rhythm, and overall aesthetic.
Blog articles should include all relevant metadata: title, author, date, categories/tags, excerpt, and (optionally) cover image.
Provide a pleasant, readable, and accessible article layout on all devices (good typography, color contrast, dark mode if possible).
Context: While the theme or subject of your blog articles is not tightly constrained, articles should be contextually appropriate for a legal-document-focused app. We recommend topics such as legal knowledge for laypeople, "how to" guides, or practical articles that could be cross-referenced with your legal documents or mock data.
Mock Data Consideration: Using LLMs is a great way to generate more believable, context-appropriate mock data that goes beyond basic lorem ipsum. You don't need factual/legal accuracy, but your content should be in plain English and fit the legal app theme
Cross-Referencing
Documents and blog articles should reference each other seamlessly on a basic level at least (use your backend or mock data).
Seamless Navigation
Users should be able to navigate easily and intuitively between all main areas of the app (documents, blogs, cross-references, and admin panel) from anywhere. 
Navigation should feel fluid and frictionless—avoid dead ends, and provide clear access points or even shortcuts between major sections.
Admin Panel
Your backend and frontend should together support an admin-only section for managing (editing, updating, and deleting) legal documents and blog articles. This should include basic authentication for admin-only routes or actions.
The admin panel should be visually distinct from standard user functionality, and include flows like edit modals, inline editing, and delete confirmation steps. You do not need to implement RBAC, extensive CMS-like features, or overengineered abstractions—keep admin logic straightforward and focus on demonstrating effective usage.
Bonus points for thoughtful admin UX: provide clear feedback, undo options, confirmation dialogs, and make sure the admin experience is both usable and slightly visually distinct from regular user features. Internal tools shouldn't feel stale, boring, or "lesser". Admin sections should be engaging and pleasant to use too.


User and Admin Concerns
User Account Management
Basic user creation with validation and secure state management.
User profile editing and deletion.

Authentication and Security
Implement basic authentication-based conditional rendering & route guarding: 
All documents: 'Public' content (sections of documents) available publicly, but full documents require login. 
Some blog articles: 'Premium' blog articles fully gated by authentication.
Demonstrate thoughtful consideration of state management, permissions, and overall security best practices.
Admin UI should be gated appropriately (e.g., by an admin login or a simple admin switch) so only authorized users can access edit/delete functionality. Make admin-only sections or controls visually and functionally distinct from standard user features.


Server-side vs. Client-side Decisions
Clearly demonstrate and justify your Nuxt.js server-side versus client-side choices. In your README or code comments, please discuss: 
Which parts of your solution run on the server (SSR, API, etc) vs. client (SPA, browser logic), and why. 
SEO benefits 
Security implications (e.g., data exposure, auth tokens, route guarding)
Performance impacts (e.g., initial load time, client hydration, perceived speed) 
Show your reasoning—there is no single "correct" answer; we're interested in how you think about these boundaries.


Containerization and Configuration
Provide a well-written Docker Compose file for containerizing your app and any supporting services, along with easy setup instructions.
You do not need to over-engineer (e.g., Kubernetes is not required), a clean Compose setup is a great middle ground. 
Clearly outline your environment management strategy (development vs. production).

Bonus Feature (Optional)
Integrate a lightweight containerized Ollama, or any similar runtime hosting a small LLM (sub-14B parameters or any model that can return plain English at a prototype-acceptable level). Here are a few ways you might explore leveraging an LLM in your prototype: 
Summarize legal documents at both the list and detailed view levels.
Suggest related documents or articles based on semantic similarity (e.g., "You might also be interested in...").
Generate key points or highlights for blog posts or legal documents.
Provide basic question answering on the content of a document (e.g., "Ask this document a question"). 
Autogenerate tags or categories from document content.

You are not expected to implement all of these suggestions. These are just possible directions (varying in complexity) to inspire your integration. Pick one or more that make sense for your prototype and demonstrate your approach.

Implementation does not need to be production-ready or overly secure; the key evaluation factor is your integration approach and thoughtful UI/UX—not raw speed or LLM response quality. Focus on creative integration, use of API calls, and user feedback (e.g., loading states, handling LLM responses gracefully). Any LLM, open weights, or local models are acceptable.

Technical Expectations
Required
TypeScript
Vue.js 3 /w Composition API (using the <script setup> syntatic sugar)
Nuxt.js 3/4
VueUse. 
When implementing utilities/composables: Use VueUse first, then ES6+ native, and only then additional libraries, if absolutely necessary. Order of precedence: VueUse > ES6+ > Libraries 
NuxtUI v3.x.x (https://ui.nuxt.com/getting-started/installation/nuxt) 
Pinia 
Vue Router 
Semantic, accessible HTML5 
Tailwind CSS 
Responsive layout and UX across common viewports (mobile, tablet, desktop) 
Ensure not only layout but also core UI/UX patterns and mental models translate intuitively and seamlessly across devices. 
Navigation, flows, and key interactions should feel natural and familiar at every breakpoint, not just visually adapt.
Encouraged but Optional
Unit tests (Vitest, Jest) 
End-to-end tests (Playwright, Cypress) 
CI/CD pipelines 
Performance, accessibility, and SEO considerations 
If you use branching, a simple, visible Git flow is nice to see. No need for excessive granularity on feature branches.

Submission Requirements
A brief README.md that includes: 
How to install and run the project 
Key design/architecture choices (just main points) 
Notes on authentication, server/client split, and Docker if used 
Any extra features, known trade-offs, or implementation notes

Evaluation Criteria
Your solution will be assessed primarily on:
Code quality & maintainability 
UI/UX and responsiveness 
Technical reasoning & architectural choices 
Use of idiomatic Vue and Nuxt patterns 
Ease of setup and clear documentation 
Overall professionalism
You are encouraged to highlight not only what you built, but how you thought about the requirements, priorities, and trade-offs.

We highly value not only your finished implementation, but also your thought process and the reasoning behind your technical decisions. Please feel free to add comments, code notes, or documentation that explain your "why" as well as your "how"--we're interested in understanding your approach and decision-making at each step.