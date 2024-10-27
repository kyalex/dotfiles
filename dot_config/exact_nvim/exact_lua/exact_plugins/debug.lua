return {
  "mfussenegger/nvim-dap",
  dependencies = {
    "rcarriga/nvim-dap-ui",
    "nvim-neotest/nvim-nio",
    "jbyuki/one-small-step-for-vimkind",
  },
  config = function()
    local dap = require("dap")
    local dapui = require("dapui")
    local osv = require("osv")
    local map = vim.keymap.set

    dapui.setup()

    -- UI Configuration
    dap.listeners.before.attach.dapui_config = function()
      dapui.open()
    end

    dap.listeners.before.launch.dapui_config = function()
      dapui.open()
    end

    dap.listeners.before.event_terminated.dapui_config = function()
      dapui.close()
    end

    dap.listeners.before.event_exited.dapui_config = function()
      dapui.close()
    end

    -- Neovim Lua debug setup
    dap.configurations.lua = {
      {
        type = "nlua",
        request = "attach",
        name = "Attach to running Neovim instance",
      }
    }

    dap.adapters.nlua = function(callback, config)
      callback({
        type = "server",
        host = config.host or "127.0.0.1",
        port = config.port or 8086
      })
    end

    -- Keymaps
    map("n", "<leader>da", dap.toggle_breakpoint, { desc = "Add breakpoint" })
    map("n", "<leader>dc", dap.continue, { desc = "Continue" })
    map("n", "<leader>ds", function() osv.launch({ port = 8086 }) end, { desc = "Start server" })
  end,
}
