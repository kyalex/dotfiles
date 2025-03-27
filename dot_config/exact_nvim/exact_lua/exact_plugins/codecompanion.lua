return {
  "olimorris/codecompanion.nvim",
  config = function()
    require("codecompanion").setup({
      opts = {
        log_level = "DEBUG", -- or "TRACE"
      }
    })
  end
}
