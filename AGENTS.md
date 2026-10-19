<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep WhatsApp URL construction and explicit new-window opening shared in the contact helper, so every contact action escapes embedded previews without losing personalized messages.
- Store public site content in a singleton site_settings row and read it through the shared site query/provider; keep defaults in one validated schema so existing content survives absent settings.
- Restrict CMS and profile mutations with authenticated server functions plus database admin-role policies; assign the designated admin role only after verified email identity, never through profile metadata or client storage.
- Store CMS uploads in the private site-media bucket and mint read-authorized signed URLs server-side with the privileged client, resolving them to the browser storage origin; no browser role may read bucket objects directly, because public buckets are workspace-restricted.
