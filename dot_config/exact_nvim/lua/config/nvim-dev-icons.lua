function ruby_icon(name)
  return {
    icon = "",
    color = "#701516",
    cterm_color = "52",
    name = name
  }
end

require("nvim-web-devicons").setup({
  override = {
    jbuilder = ruby_icon("jbuilder"),
    Gemfile = ruby_icon("Gemfile"),
    Dangerfile = ruby_icon("Dangerfile"),
  }
})
