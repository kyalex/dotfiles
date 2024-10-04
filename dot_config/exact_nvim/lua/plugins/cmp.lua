return {
  'hrsh7th/nvim-cmp',
  event = { "BufReadPre", "BufNewFile" },
  dependencies = {
    {'hrsh7th/cmp-buffer'},
    {'hrsh7th/cmp-path'},
    {'hrsh7th/cmp-nvim-lsp'},
    {'hrsh7th/cmp-nvim-lua'},
    {'saadparwaiz1/cmp_luasnip'},
    {'hrsh7th/cmp-cmdline'},
    {'L3MON4D3/LuaSnip'},
    {
      'zbirenbaum/copilot.lua',
      cmd = "Copilot",
      build = ":Copilot auth",
      config = function()
        require("copilot").setup({
          suggestion = { enabled = false },
          panel = { enabled = false },
        })
      end,
    },
    {
      "zbirenbaum/copilot-cmp",
      after = { "copilot.lua" },
      config = function ()
        require("copilot_cmp").setup()
      end
    },
  },
  config = function()
    require('cmp').setup({
      sources = {
        { name = 'copilot' },
        { name = 'nvim_lsp' },
        { name = 'buffer' },
        { name = 'path' },
      },
    })
  end
}

