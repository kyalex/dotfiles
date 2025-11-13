require("copilot_cmp").setup()

-- CMP
local cmp = require("cmp")
-- Mason
require("mason").setup()
require("mason-lspconfig").setup({
  ensure_installed = {
    "tailwindcss",
    "ruby_lsp",
    "ts_ls",
    "eslint",
    "zls"
  }
})

-- Attach nvim-cmp capabilities
local capabilities = require("cmp_nvim_lsp").default_capabilities()

-- Setup Ruby LSP
vim.lsp.config.ruby_lsp = {
  cmd = { "ruby-lsp" },
  filetypes = { "ruby", "slim" },
  root_markers = { "Gemfile", ".git", "." },
  settings = {
    ruby_lsp = {
      enabledFeatures = {
        "formatting", -- Enable LSP formatting
        "diagnostics", -- Enable diagnostics
        "codeActions", -- Enable code actions
      },
    },
  },
  capabilities = capabilities,
}

-- Setup JS LSP
vim.lsp.config.ts_ls = {
  filetypes = {
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
  },
  cmd = { "typescript-language-server", "--stdio" },
  root_markers = { "package.json", "tsconfig.json", ".git" },
  capabilities = capabilities,
}

-- Setup ESLint
vim.lsp.config.eslint = {
  capabilities = capabilities,
}

-- Setup LSP from Lua
vim.lsp.config.lua_ls = {
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
  },
  capabilities = capabilities,
}

-- Zig LSP
vim.lsp.config.zls = {
  capabilities = capabilities,
}

-- Tailwind CSS LSP
vim.lsp.config.tailwindcss = {
  filetypes = {
    "html",
    "ruby",
    "eruby",
    "slim",
  },
  settings = {
    tailwindCSS = {
      includeLanguages = {
        ruby = "erb",
      },
      experimental = {
        classRegex = {
          [[class= "([^"]*)]],
          [[class: "([^"]*)]],
          [[class= '([^"]*)]],
          [[class: '([^"]*)]],
          '~H""".*class="([^"]*)".*"""',
          '~F""".*class="([^"]*)".*"""',
        },
      }
    }
  },
  capabilities = capabilities,
}

-- Enable LSP servers
vim.lsp.enable({ "ruby_lsp", "ts_ls", "eslint", "lua_ls", "zls", "tailwindcss" })

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

vim.keymap.set("n", "<leader>ld", vim.diagnostic.open_float, { desc = "Show diagnostics in a float" })
vim.keymap.set("n", "<leader>lc", vim.lsp.buf.code_action, { desc = "Code Actions" })

