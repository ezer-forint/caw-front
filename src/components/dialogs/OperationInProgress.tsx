import {
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, ModalFooter,
  Heading, Text, CircularProgress, CircularProgressProps, VStack
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

type Props = {
  title: string;
  message: string;
  footer: string;
  isOpen: boolean;
  circularProps?: CircularProgressProps;
  onClose: () => void;
}

export default function OperationInProgressModal(props: Props) {

  const { title, message, footer, isOpen, onClose,
    circularProps = {
      isIndeterminate: true,
      size: '80px',
      thickness: '4px',
      color: 'blue.500',
    } } = props;

  return (
    <Modal
      isCentered
      motionPreset='slideInBottom'
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <VStack
            justifyContent={'center'}
          >
            <CircularProgress {...circularProps} />
            <Heading as='h4' size='md'>{title}</Heading>
            <Text pt={4} >{message}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter
          justifyContent={'center'}
        >
          <Text
            colorScheme={'blue'}
          >
            {footer}
          </Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

type BCOProps = {
  message: string;
  processing: boolean;
  txSent: boolean;
  circularProps?: CircularProgressProps;
  onClose: () => void;
}

export function BlockChainOperationInProgressModal({ processing, txSent, onClose, message, circularProps }: BCOProps) {
  const { t } = useTranslation();
  return (
    <OperationInProgressModal
      isOpen={processing}
      title={txSent ? t('wallet.txSubmitted') : t('wallet.waitingConfirm')}
      message={message}
      footer={txSent ? t('wallet.waitConfirmedTx') : t('wallet.confirmTxInWallet')}
      circularProps={circularProps}
      onClose={onClose}
    />
  );
}