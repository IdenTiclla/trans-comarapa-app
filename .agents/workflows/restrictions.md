---
description: Rules and restrictions for this project that must always be followed.
---

# Project-Level Restrictions

## ❌ Do NOT use `browser_subagent`

Never use the `browser_subagent` tool in this project. It cannot connect to the local dev servers and causes failures. 

For UI verification, instruct the user to check the page manually instead.
