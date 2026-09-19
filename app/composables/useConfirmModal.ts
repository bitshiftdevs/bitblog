import ConfirmModal from '~/components/Admin/ConfirmModal.vue';

type Color = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral';

type ConfirmActionProps = {
  title: string;
  question: string;
  confirmLabel?: string;
  confirmColor?: Color;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
};

export function confirmAction(props: ConfirmActionProps) {
  const overlay = useOverlay();
  const modal = overlay.create(ConfirmModal);
  modal.open(props);
}
