return {
  "nvim-telescope/telescope.nvim",
  tag = "0.1.8",
  config = function()
    local telescope = require("telescope")
    local builtin = require("telescope.builtin")
    local actions = require("telescope.actions")

    telescope.setup({
      defaults = {
        file_ignore_patterns = { ".git/", "node_modules/" },
        mappings = {
          i = {
            ["<C-q>"] = actions.send_to_qflist,
            ["<C-e>"] = actions.send_selected_to_qflist,
          },
        },
      },
      extensions = {
        fzf = {
          fuzzy = true,                    -- false will only do exact matching
          override_generic_sorter = true,  -- override the generic sorter
          override_file_sorter = true,     -- override the file sorter
          case_mode = "smart_case",        -- or "ignore_case" or "respect_case"
                                           -- the default case_mode is "smart_case"
        }
      },
    })

    telescope.load_extension("fzf")

    -- Keymaps
    local map = vim.keymap.set

    map("n", "<leader> ", builtin.find_files, { desc = "Telescope find files" })
    map("n", "<leader>/", builtin.live_grep, { desc = "Telescope live grep" })
    map("n", "<leader>,", builtin.buffers, { desc = "Telescope buffers" })
    map("n", "<leader>fr", builtin.oldfiles, { desc = "Telescope Old files" })
    map("n", "<leader>fq", builtin.quickfix, { desc = "Telescope Quickfix list" })
  end,
}
