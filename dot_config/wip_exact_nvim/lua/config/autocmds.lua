-- Open Neotree on startup
vim.api.nvim_create_autocmd("VimEnter", {
  command = "Neotree toggle",
})
