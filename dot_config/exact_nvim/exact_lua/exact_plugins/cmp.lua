return {
  "hrsh7th/nvim-cmp",
  event = { "BufReadPre", "BufNewFile" },
  dependencies = {
    { "hrsh7th/cmp-buffer" }, -- Buffer completions
    { "hrsh7th/cmp-path" }, -- Path completions
    { "hrsh7th/cmp-nvim-lsp" }, -- LSP source for nvim-cmp
    { "hrsh7th/cmp-cmdline" }, -- Cmdline completions
    { "L3MON4D3/LuaSnip" }, -- Snippets plugin
    {
      "zbirenbaum/copilot.lua",
      opts = true,
      cmd = "Copilot",
      build = ":Copilot auth",
    },
    {
      "zbirenbaum/copilot-cmp",
    },
  },
}

