return {
  "Wansmer/treesj",
  keys = { "<space>m", "<space>j", "<space>s" },
  dependencies = { "nvim-treesitter/nvim-treesitter" }, -- if you install parsers with `nvim-treesitter`
  config = function()
    local tsj = require("treesj")

    tsj.setup({ use_default_keymaps = false })

    vim.keymap.set("n", "<leader>m", tsj.toggle)
  end,
}
