const colors = require("tailwindcss/colors");

const round = (num) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, '$1')
    .replace(/\.0$/, '')
const rem = (px) => `${round(px / 16)}rem`
const em = (px, base) => `${round(px / base)}em`

module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        cyan: colors.cyan,
        pink: colors.pink,
        blueGray: colors.blueGray,
        coolGray: colors.coolGray,
        disabledSelect: "#283240"
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            h1: {
              color: '#FFF',
              textAlign: 'center',
            },
            h2: {
              color: '#FFF',
              textAlign: 'center',
            },
            h3: {
              color: '#FFF',
            },
            h4: {
              color: '#FFF',
            },
            h5: {
              color: '#FFF',
            },
            a: {
              color: theme('colors.pink.400'),
            },
            strong: {
              color: '#FFF'
            },
            blockquote: {
              color: '#FFF'
            }
          },
        }
      }),
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["hover", "focus", "disabled"],
      backgroundColor: ["disabled"],
      translate: ["hover"],
      display: ["group-hover"],
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
