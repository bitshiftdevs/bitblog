import ConfirmModal from '~/components/Admin/ConfirmModal.vue';

type ConfirmActionProps = {
  title: string;
  question: string;
  onConfirm: VoidFunction;
};
export function confirmAction({ title, question, onConfirm }: ConfirmActionProps) {
  const overlay = useOverlay();
  const modal = overlay.create(ConfirmModal);

  modal.open({ title, question, onConfirm });
}
