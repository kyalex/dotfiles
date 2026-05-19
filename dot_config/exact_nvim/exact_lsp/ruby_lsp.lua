return {
  cmd = { "ruby-lsp-mise" },
  filetypes = { "ruby", "eruby", "slim" },
  init_options = {
    addonSettings = {
      ["Ruby LSP Rails"] = {
        enablePendingMigrationsPrompt = false,
      },
    },
  },
}
