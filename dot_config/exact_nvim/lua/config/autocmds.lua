-- Open Neotree on startup
vim.api.nvim_create_autocmd("VimEnter", {
  command = "Neotree toggle",
})

-- Highlight text on yank
vim.api.nvim_create_autocmd("TextYankPost", {
  callback = function()
    vim.highlight.on_yank()
  end,
})
