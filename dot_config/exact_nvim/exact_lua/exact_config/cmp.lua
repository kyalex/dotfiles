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
  ensure_installed = { "ruby_lsp", "ts_ls", "eslint" }
})

-- Setup Ruby LSP
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

-- Setup JS LSP
lspconfig.ts_ls.setup {
  filetypes = {
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
  },
  cmd = { "typescript-language-server", "--stdio" },
  root_dir = lspconfig.util.root_pattern("package.json", "tsconfig.json", ".git"),
}

require("lspconfig").eslint.setup{}

-- Setup LSP from Lua
lspconfig.lua_ls.setup {
  on_init = function(client)
    if client.workspace_folders then
      local path = client.workspace_folders[1].name
      if vim.uv.fs_stat(path .. "/.luarc.json") or vim.uv.fs_stat(path .. "/.luarc.jsonc") then
        return
      end
    end

    client.config.settings.Lua = vim.tbl_deep_extend("force", client.config.settings.Lua, {
      runtime = {
        version = "LuaJIT"
      },
      -- Make the server aware of Neovim runtime files
      workspace = {
        checkThirdParty = false,
        library = {
          vim.env.VIMRUNTIME,
          "${3rd}/luv/library" -- vim.uv support
        }
      }
    })
  end,
  settings = {
    Lua = {}
  }
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

-- Attach nvim-cmp capabilities
local capabilities = require("cmp_nvim_lsp").default_capabilities()

lspconfig.ruby_lsp.setup { capabilities = capabilities }
lspconfig.ts_ls.setup { capabilities = capabilities }