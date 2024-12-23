return {
  "folke/which-key.nvim",
  event = "VeryLazy",
  opts = {},
  config = function()
    vim.keymap.set(
      "n",
      "<leader>?",
      function()
        require("which-key").show({ global = false })
      end,
      {
        desc = "Buffer Local Keymaps (which-key)",
      }
    )
  end
}
