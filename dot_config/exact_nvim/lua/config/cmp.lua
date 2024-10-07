-- Copilot
require("copilot").setup({
  suggestion = { enabled = false },
  panel = { enabled = false },
})

-- Copilot completion
require("copilot_cmp").setup()

-- CMP
local cmp = require("cmp")
local lspconfig = require("lspconfig")

-- Mason
require("mason").setup()
require("mason-lspconfig").setup({
  ensure_installed = { "ruby_lsp" }
})

-- Setup LSP
lspconfig.ruby_lsp.setup {
  cmd = { "bundle", "exec", "ruby-lsp" },
  filetypes = { "ruby" },
  root_dir = lspconfig.util.root_pattern("Gemfile", ".git", "."),
  settings = {
    ruby_lsp = {
      enabledFeatures = {
        "formatting", -- Enable LSP formatting
        "diagnostics", -- Enable diagnostics
        "codeActions", -- Enable code actions
      },
    },
  },
}

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
      require('luasnip').lsp_expand(args.body)
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

-- Attach nvim-cmp capabilities to ruby-lsp
local capabilities = require('cmp_nvim_lsp').default_capabilities()

lspconfig.ruby_lsp.setup {
  capabilities = capabilities,
}
