return {
  "Wansmer/treesj",
  keys = { "<space>m", "<space>j", "<space>s" },
  dependencies = { "nvim-treesitter/nvim-treesitter" }, -- if you install parsers with `nvim-treesitter`
  config = function()
    local tsj = require("treesj")
    local lang_utils = require('treesj.langs.utils')

    tsj.setup({
      use_default_keymaps = false,
      max_join_length = 2048,
      langs = {
        ruby = {
          array = lang_utils.set_preset_for_list({
            join = {
              space_in_brackets = false,
            },
            split = {
              last_separator = false,
            }
          })
        }
      }
    })

    vim.keymap.set("n", "<leader>m", tsj.toggle)
  end,
}
