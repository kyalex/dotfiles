return {
  cmd = {
    "mise", "exec", "--", "ruby-lsp"
  },
  filetypes = { "ruby", "slim" },  init_options = {
    addonSettings = {
      ["Ruby LSP Rails"] = {
        enablePendingMigrationsPrompt = false,
      },
    },
  },
  root_markers = { "Gemfile", ".git", "." },
}
