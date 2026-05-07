local M = {}

local function macos_is_light()
  local handle = io.popen("defaults read -g AppleInterfaceStyle 2>/dev/null")
  if not handle then return true end
  local result = handle:read("*a") or ""
  handle:close()
  return not result:match("Dark")
end

function M.open()
  if macos_is_light() then
    local base  = vim.fn.expand("~/Library/Application Support/lazygit/config.yml")
    local light = vim.fn.expand("~/Library/Application Support/lazygit/config-light.yml")
    vim.env.LG_CONFIG_FILE = base .. "," .. light
  else
    vim.env.LG_CONFIG_FILE = nil
  end
  vim.cmd("LazyGit")
end

function M.blame_line(opts)
  opts = vim.tbl_deep_extend("force", {
    count = 3,
    filetype = "git",
    size = {
      width = 0.6,
      height = 0.6,
    },
    border = "rounded",
  }, opts or {})
  local cursor = vim.api.nvim_win_get_cursor(0)
  local line = cursor[1]
  local file = vim.api.nvim_buf_get_name(0)
  local cmd = { "git", "-C", ".", "log", "-n", opts.count, "-u", "-L", line .. ",+1:" .. file }
  return require("lazy.util").float_cmd(cmd, opts)
end

return M
