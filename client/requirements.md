## Packages
date-fns | Formatting dates for reports and sessions
recharts | Beautiful charts for the reports page
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-cairo)", "sans-serif"],
  display: ["var(--font-cairo)", "sans-serif"],
}

The UI uses Arabic labels for a localized experience while maintaining standard left-to-right (LTR) layout for compatibility with the sidebar component, unless dir="rtl" is explicitly added to the body.
