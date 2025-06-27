import { Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";

const DeleteModal = ({
  modalText,
  title,
  onCancel,
  onConfirm,
  DeleteButton,
}) => {
  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: <Text size="lg">{title}</Text>,
      centered: true,
      children: modalText,
      labels: { confirm: "Sil", cancel: "İptal Et" },
      confirmProps: { color: "red" },
      onCancel,
      onConfirm,
    });

  if (DeleteButton) return <DeleteButton onClick={openDeleteModal} />;

  return (
    <Button onClick={openDeleteModal} color="red">
      Sil
    </Button>
  );
};

export default DeleteModal;
