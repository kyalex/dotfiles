return {
  cmd = { vim.fn.expand("$MASON/bin/rust-analyzer") },
  filetypes = { "rust" },
  root_markers = { "Cargo.toml", "rust-project.json", ".git" },
}
