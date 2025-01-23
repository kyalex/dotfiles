return {
  "navarasu/onedark.nvim",
  lazy = false,
  priority = 1000,
  opts = {},
  config = function()
    local function ruby_icon(name)
      return {
        icon = "",
        color = "#701516",
        cterm_color = "52",
        name = name
      }
    end

    require("nvim-web-devicons").setup({
      override = {
        ["jbuilder.tt"] = ruby_icon("jbuilder"),
        ["rb.tt"] = ruby_icon("ruby"),
        jbuilder = ruby_icon("jbuilder"),
        Gemfile = ruby_icon("Gemfile"),
        Dangerfile = ruby_icon("Dangerfile"),
      }
    })

    require("onedark").setup {
      style = "warmer"
    }

    -- load the colorscheme here
    vim.cmd.colorscheme "onedark"
  end,
}
