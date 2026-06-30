return {
  "mason-org/mason-lspconfig.nvim",
  opts = {
    ensure_installed = {
      "ruby_lsp",
      "ts_ls",
      "eslint",
      "lua_ls",
      "rust_analyzer",
      "zls",
      "tailwindcss"
    },
  },
  dependencies = {
    {
      "mason-org/mason.nvim",
      opts = {},
    },
  },
}
