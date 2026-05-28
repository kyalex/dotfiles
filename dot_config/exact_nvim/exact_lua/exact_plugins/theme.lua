return {
  "catppuccin/nvim",
  name = "catppuccin",
  lazy = false,
  priority = 1000,
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
        Brewfile = ruby_icon("Brewfile"),
      }
    })

    require("catppuccin").setup({
      background = { light = "latte", dark = "mocha" },
    })

    local function macos_is_dark()
      local handle = io.popen("defaults read -g AppleInterfaceStyle 2>/dev/null")
      if not handle then return true end
      local out = handle:read("*a") or ""
      handle:close()
      return out:lower():find("dark") ~= nil
    end

    local function apply_theme()
      local dark = macos_is_dark()
      vim.o.background = dark and "dark" or "light"
      vim.cmd.colorscheme(dark and "catppuccin-mocha" or "catppuccin-latte")
    end

    apply_theme()

    vim.api.nvim_create_autocmd({ "FocusGained", "VimResume" }, {
      callback = apply_theme,
    })
  end,
}
