-- Enable LSP servers
vim.lsp.enable({
  "ruby_lsp",
  "ts_ls",
  "eslint",
  "lua_ls",
  "zls",
  "tailwindcss"
})

require("copilot_cmp").setup()

-- CMP
local cmp = require("cmp")

-- Autocompletion for /
cmp.setup.cmdline("/", {
  mapping = cmp.mapping.preset.cmdline(),
  sources = {
    { name = "buffer" }
  }
})

-- Autocompletion for :
cmp.setup.cmdline(":", {
  mapping = cmp.mapping.preset.cmdline(),
  sources = cmp.config.sources({
    { name = "path" }
  },
  {
    {
      name = "cmdline",
      option = {
        ignore_cmds = { "Man", "!" }
      }
    }
  })
})

-- CMP setup
cmp.setup({
  snippet = {
    expand = function(args)
      require("luasnip").lsp_expand(args.body)
    end,
  },
  sources = {
    { name = "copilot" },
    { name = "nvim_lsp" },
    { name = "buffer" },
    { name = "path" },
  },
  window = {
    completion = cmp.config.window.bordered(),
  },
  mapping = cmp.mapping.preset.insert({
    ["<CR>"] = cmp.mapping.confirm({ select = true }),
    ["<Tab>"] = cmp.mapping.select_next_item(),
    ["<S-Tab>"] = cmp.mapping.select_prev_item(),
  }),
})

-- Diagnostic
vim.diagnostic.config({
  virtual_text = {
    prefix = "●", -- Change prefix for diagnostic messages
    spacing = 4,  -- Add spacing between diagnostic and text
  },
  signs = true,  -- Show signs in the sign column
  underline = true, -- Underline the diagnostic text
  severity_sort = true, -- Sort diagnostics by severity
  float = {
    border = "rounded", -- Rounded border for floating windows
    source = true,  -- Show source of diagnostic
    header = "Diagnostics", -- Header for the float window
  },
  update_in_insert = false, -- Disable diagnostics updates in insert mode
})

-- Keymaps
vim.keymap.set("n", "<leader>ld", vim.diagnostic.open_float, { desc = "Show diagnostics in a float" })
vim.keymap.set("n", "<leader>lc", vim.lsp.buf.code_action, { desc = "Code Actions" })

