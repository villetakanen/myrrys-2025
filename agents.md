# Agent Instructions

## SRD Link Handling

The content for the Systems Reference Document (SRD) is located in the `LnL-SRD` directory at the project root. This content is built into the site under the `/letl/srd/` path.

A custom Remark plugin (`src/remark/remarkUrlLowercase.ts`) handles link processing for these files to ensure they work correctly in the SSG build.

### Rules for SRD Links:

1.  **Relative Paths:** Links in SRD Markdown files are often relative (e.g., `[Link](../folder/file.md)`). The plugin automatically resolves these relative paths based on the file's location within `LnL-SRD` and prefixes them with `/letl/srd/`.
2.  **Lowercase URLs:** All generated URLs are converted to lowercase. This is a strict requirement.
    *   **Implementation:** This is enforced in two places:
        1.  `src/remark/remarkUrlLowercase.ts`: Converts links in Markdown content to lowercase.
        2.  `src/pages/letl/srd/[...id].astro`: Forces generated page URLs to be lowercase (via `post.id.toLowerCase()`) to ensure consistency across case-sensitive environments (like Netlify/Linux).
    *   **Exception:** Links to download files (currently defined as ending in `.pdf`) are NOT lowercased to preserve file system case sensitivity if needed (though generally good practice to keep filenames lowercase too).
3.  **Absolute URLs:** Absolute URLs (starting with `http` or `/`) are generally left as is, but internal absolute paths (starting with `/`) are also lowercased.

### When modifying SRD content or the build process:

*   Ensure `LnL-SRD` remains at the project root or update the plugin logic accordingly.
*   Do not manually hardcode `/letl/srd/` prefixes in the Markdown source if you want to maintain portability of the `LnL-SRD` repo. The plugin handles the mapping.
