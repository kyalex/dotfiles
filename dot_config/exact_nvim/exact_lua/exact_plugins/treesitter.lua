return {
  "nvim-treesitter/nvim-treesitter",
  branch = "main",
  lazy = false,
  build = ":TSUpdate",
  config = function()
    require("nvim-treesitter").install({
      "ruby",
      "rust",
      "c",
      "lua",
      "vim",
      "vimdoc",
      "query",
      "markdown",
      "markdown_inline",
      "javascript",
      "typescript",
      "tsx",
      "sql",
      "yaml",
      "html",
    })

    vim.api.nvim_create_autocmd("FileType", {
      callback = function(args)
        local bufnr = args.buf
        local max_filesize = 100 * 1024
        local ok, stats = pcall(vim.loop.fs_stat, vim.api.nvim_buf_get_name(bufnr))
        if ok and stats and stats.size > max_filesize then
          return
        end
        pcall(vim.treesitter.start, bufnr)
      end,
    })

    require("nvim-ts-autotag").setup({
      filetypes = {
        "html",
        "xml",
        "eruby",
        "embedded_template",
        "javascript",
        "javascriptreact",
      },
    })
  end,
  dependencies = {
    { "windwp/nvim-ts-autotag" },
  },
}
