return {
  'magicduck/grug-far.nvim',
  config = function()
    require('grug-far').setup({});

    vim.keymap.set("n", "<leader>r", "<cmd>GrugFar<cr>", { desc = "Open Grug Far" })
  end
}
