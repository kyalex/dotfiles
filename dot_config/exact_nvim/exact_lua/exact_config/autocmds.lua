-- Open Neotree on startup

-- Highlight text on yank
vim.api.nvim_create_autocmd("TextYankPost", {
  callback = function()
    vim.highlight.on_yank()
  end,
})

-- Highlight zshrc
vim.api.nvim_create_autocmd({ "BufRead", "BufNewFile" }, {
  pattern = "*zshrc",
  callback = function()
    vim.bo.filetype = "bash"
  end,
})

-- Slim
vim.filetype.add({
  extension = {
    slim = "slim",
  },
})

vim.api.nvim_create_autocmd("FileType", {
  pattern = "slim",
  callback = function()
    vim.diagnostic.enable(false)
  end,
})

-- Helm
vim.filetype.add({
  extension = {
    gotmpl = 'gotmpl',
  },
  pattern = {
    [".*/templates/.*%.tpl"] = "helm",
    [".*/templates/.*%.ya?ml"] = "helm",
    ["helmfile.*%.ya?ml"] = "helm",
  },
})
