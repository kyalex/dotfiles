return {
  cmd = {
    vim.fn.expand("$MASON/bin/tailwindcss-language-server"),
    "--stdio",
  },
  filetypes = {
    'html',
    'ruby',
    'eruby',
    'slim',
  },
  settings = {
    tailwindCSS = {
      validate = true,
      classAttributes = {
        'class',
        'className',
        'class:list',
        'classList',
        'ngClass',
      },
      includeLanguages = {
        eruby = 'erb',
        templ = 'html',
        ruby = 'erb',
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
    },
  },
  workspace_required = true,
  root_markers = {
    'tailwind.config.js',
    'tailwind.config.cjs',
    'tailwind.config.mjs',
    'tailwind.config.ts',
  },
}
