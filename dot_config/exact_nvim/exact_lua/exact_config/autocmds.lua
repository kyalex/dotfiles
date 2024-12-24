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
vim.api.nvim_create_autocmd({ "BufNewFile", "BufRead" }, {
  pattern = "*.lua.erb",
  callback = function()
    vim.bo.filetype = "lua.eruby"
  end,
})

local group = vim.api.nvim_create_augroup("lua_erb_highlighting", { clear = true })

vim.api.nvim_create_autocmd("FileType", {
  group = group,
  pattern = "lua.eruby",
  callback = function()
    vim.opt_local.syntax = "eruby"
    vim.cmd("syntax include @lua syntax/lua.vim") -- Include Lua syntax
  end,
})

-- Highlight zshrc
vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
  pattern = "*zshrc",
  callback = function()
    vim.bo.filetype = "bash"
  end,
})
