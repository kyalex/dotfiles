return {
  "hrsh7th/nvim-cmp",
  event = { "BufReadPre", "BufNewFile" },
  dependencies = {
    { "hrsh7th/cmp-buffer" },
    { "hrsh7th/cmp-path" },
    { "hrsh7th/cmp-nvim-lsp" },
    { "hrsh7th/cmp-nvim-lua" },
    { "saadparwaiz1/cmp_luasnip" },
    { "hrsh7th/cmp-cmdline" },
    { "L3MON4D3/LuaSnip" },
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

