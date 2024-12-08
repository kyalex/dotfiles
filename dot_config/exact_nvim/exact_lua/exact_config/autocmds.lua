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

-- Hightlight lua erb??
vim.cmd([[
  autocmd BufNewFile,BufRead *.lua.erb set filetype=lua.eruby

  augroup lua_erb_highlighting
    autocmd!
    autocmd FileType lua.eruby setlocal syntax=eruby
    autocmd FileType lua.eruby setlocal syntax+=lua
  augroup END
]])
