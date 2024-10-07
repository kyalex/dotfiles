-- Make sure to setup `mapleader` and `maplocalleader` before
-- loading lazy.nvim so that mappings are correct.
vim.g.mapleader = " "
vim.g.maplocalleader = " "

-- Suppress messagesin command line
-- W: "written" message
-- I: Startup info messages
-- c and C: completion messages
vim.opt.shortmess:append({ W = true, I = true, c = true, C = true })

-- Number of spaces tabs count for
vim.opt.tabstop = 2
-- Size of an indent
vim.opt.shiftwidth = 2
-- Use spaces instead of tabs
vim.opt.expandtab = true
-- Number of spaces tabs count for
vim.bo.softtabstop = 2

-- Save undo history to a file
vim.opt.undofile = true
vim.opt.undodir = os.getenv("HOME") .. "/.vim/undodir"

-- Enable line numbers display
vim.opt.number = true
-- Swap absolute line numbers to relative ones
vim.opt.relativenumber = true

-- Disable netrw
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

-- Clipboard
vim.opt.clipboard = "unnamed,unnamedplus"

-- Additional info column before line numbers
vim.opt.signcolumn = "yes"
-- Highlight current line
vim.opt.cursorline = true
-- Show invisible characters
vim.opt.list = true

-- Hightlight jbuilder files as ruby
vim.cmd([[
  au BufNewFile,BufRead *.jbuilder,Dangerfile set ft=ruby
]])
