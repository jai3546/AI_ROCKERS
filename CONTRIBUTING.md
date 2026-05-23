# Contributing to VidyAi

Welcome to the VidyAi codebase! We are thrilled that you want to help us make learning adaptive, accessible, and human-centric. Whether you are a student making your very first pull request or an experienced developer looking to optimize our models, your contributions are highly valued.

---

## We Are Brand New!

Because the VidyAi project has just gone open-source, the Issues tab on GitHub might be empty. 

Before starting to write any code, please:
1. Check the existing issues first.
2. If no issue describes the bug you found or the feature you want to build, please **create a new issue** describing your planned changes and get approval from a maintainer before coding.

### Great Areas for Initial Contributions
* **Documentation**: Clarifying setup guides, adding inline TypeScript code comments, or improving error messages.
* **Bug Hunting**: Finding bugs, writing test cases, or suggesting code fixes.
* **UI/UX Polish**: Adjusting Tailwind layout alignments, container spacing, and refining Framer Motion animations.
* **Cross-Browser Testing**: Testing `face-api.js` webcam tracking, calibration modals, and voice assist navigation across Chrome, Firefox, and Safari on different operating systems.

---

## First-Time Contributor Guide

If this is your first time contributing to open source, please don't be nervous! 
* Look for issues marked with the **good first issue** label.
* No contribution is too small—even correcting a single typo in a comment helps the community.
* If you need help with git, branching, or next.js, feel free to comment in your issue or pull request, and we will guide you through the process.

---

## Local Development Workflow

When you are ready to work on an issue, follow these terminal commands to set up your branch:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
npm install
node scripts/download-face-api-models.js
```

*Note: Always base your work on a new branch created from the latest version of the `main` branch. Avoid making commits directly on the `main` branch.*

---

## 🎨 Design & UI/UX Contributions

Since VidyAi serves both students (learning dashboards) and schools (management portals), keeping our user experience clean, non-distracting, and highly responsive is a top priority. If you want to contribute to our interface components:

* **Visual Proofs**: Always attach high-quality screenshots, UI mockups, or GIFs showcasing your changes directly inside your Pull Request or Issue description.
* **Explain the UX Impact**: Briefly explain your design decisions—especially how they affect accessibility (WCAG compliance) or decrease cognitive load for a struggling student.
* **Modular UI**: Build components using our existing layout tokens (Tailwind CSS + Radix UI primitives) to keep the design language unified across dashboards.

---

## 💡 Suggesting Features

When opening a new Feature Request, please copy and use this structured template to help our maintainers review it quickly:

```markdown
### Feature Idea
A short, clear summary of your feature concept.

### Target Portal
Does this apply to the [Student Learning Dashboard] or the [School/Educator Admin Panel]?

### Why It’s Useful
How does this feature make learning more adaptive, or how does it help teachers track student engagement better?
```
---

## Pull Request Checklist

Before you open a Pull Request, please run these checks to ensure your changes build correctly and don't introduce runtime errors:

| Check Item | Command to Run | Why This Matters |
|---|---|---|
| **Code Formatting** | `npm run lint` | Catches syntax errors, code styling issues, and type warnings early. |
| **Production Build** | `npm run build` | Ensures your changes compile successfully under the strict Next.js compiler without breaking production. |
| **Client-Side Safety** | Manual Check | **Crucial:** Verify that any React component handling `face-api.js`, browser Webcams, or Canvas APIs includes the `"use client"` directive at the very top. |

---

## Commit Message Conventions

We use Conventional Commits to keep our repository history clean and easy to scan:

```
type(scope): description
```

### Examples
* `feat(tutor): add multi-turn conversation memory`
* `fix(tracking): resolve webcam permission handling bug`
* `docs(readme): update installation steps`
* `style(dashboard): improve responsive layout grid spacing`

---

## Contributor Support & Escalation

We want our community to feel supported and respected at every step of their development journey:

* **Open Q&A**: Ask questions freely directly inside the Issues tracker or our GitHub Discussions tab.
* **Timely Reviews**: Our maintainers review submissions systematically. Expect constructive, encouraging feedback on your code.
* **Escalation Path**: For complex design architectural decisions, model calibration issues, or deep feature alignment, maintainers are open to scheduling synchronous sync-ups via dedicated community spaces (Slack/Discord channels).

---

## Rules of Engagement

1. **Claim before coding**: Comment on an issue to declare you are working on it. This avoids duplicate work and ensures we can assign the issue to you.
2. **Follow the Code of Conduct**: Maintain a respectful, inclusive, and collaborative tone when discussing issues and reviewing code.
3. **Keep branches clean**: One branch per feature or bug fix. Avoid packing unrelated edits into a single pull request.

---

## License

By contributing, you agree to license your work under the MIT License. Contributors will be officially recognized and credited inside our `CONTRIBUTORS.md` index file as our community grows.

---

Thank you for dedicating your time, creativity, and skills to making adaptive education accessible to students worldwide! 💙
