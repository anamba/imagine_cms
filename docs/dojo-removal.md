# Dojo removal

Imagine CMS uses HugeRTE for rich text and CMS-owned HTML dialogs throughout
management. The Dojo distribution and Editor2 integration have been removed.

Host applications upgrading from a version with Dojo should:

- Remove `ImagineCms.use_legacy_dojo_editor` configuration. The option no longer
  exists; HugeRTE is the only editor.
- Remove application-owned Dojo script tags, asset precompile entries, and calls
  to `imagine_cms:install_dojo`. That installation task no longer exists.
- Update custom dialog calls from `showDojoDialog`/`hideDojoDialog` to
  `showImagineCmsDialog`/`hideImagineCmsDialog`. No compatibility aliases remain.
- Clear cached CMS HTML when deploying, then restart the application. Rebuild
  assets and remove previously deployed Dojo assets using the host's normal
  asset cleanup process; removing them from the gem does not erase old copies
  already installed in a site's `public/assets` directory.

Page properties, image/file selection, thumbnails, galleries, page selection,
and page-list configuration use the existing CMS dialog elements. There are no
changes to CMS content storage or editing permissions.

Validation includes the toolkit-free dialog behavior suite:

```sh
node test/javascript/dialogs_test.cjs
```
