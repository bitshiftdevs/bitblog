export default defineAppConfig({
  ui: {
    prose: {
      h1: {
        slots: {
          base: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        },
      },
      p: {
        base: 'leading-7 [&:not(:first-child)]:mt-6',
      },
    },
  },
});
