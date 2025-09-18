import type { BadgeProps } from '@nuxt/ui';

type Color =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'base'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | undefined;

export const getStatusColor = (value: number): Color => {
  return value >= 80
    ? 'success'
    : value >= 50 && value < 80
      ? 'warning'
      : 'error';
};
