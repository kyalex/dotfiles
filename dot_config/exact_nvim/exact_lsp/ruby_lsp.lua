return {
  cmd = {
    "mise", "exec", "--", "ruby-lsp"
  },
  filetypes = { "ruby", "slim" },
  root_markers = { "Gemfile", ".git", "." },
  settings = {
    ruby_lsp = {
      enabledFeatures = {
        "formatting", -- Enable LSP formatting
        "diagnostics", -- Enable diagnostics
        "codeActions", -- Enable code actions
      },
    },
  },
}
