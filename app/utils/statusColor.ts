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

export const getStatusColor = (value: number | string): Color => {
  if (typeof value === 'string') {
    switch (value) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'scheduled':
        return 'info';
      case 'archived':
        return 'error';
      default:
        return 'neutral';
    }
  }
  return value >= 80 ? 'success' : value >= 50 && value < 80 ? 'warning' : 'error';
};
