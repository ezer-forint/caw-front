import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
    Container, Divider, Text, Button, useColorModeValue, Input, FormControl, FormErrorMessage, Spacer, HStack,
    VStack, Center, InputLeftAddon, InputGroup, InputRightAddon, useDisclosure, Link
} from "@chakra-ui/react";

import AlertDialog from "src/components/dialogs/AlertDialog";
import Block from "src/components/Block";
import ConnectWalletButton from "src/components/buttons/ConnectWalletButton2";
import AlertMessage from "src/components/AlertMessage";

import { useCawProvider } from "src/context/WalletConnectContext";
import { MILLION } from 'src/utils/constants';
import { fDecimal, kFormatter } from 'src/utils/formatNumber';
import { sentenceCase, shortenAddress } from "src/utils/helper";
import { useETHBalance, useMintableCAWContract } from "src/hooks";
import { getBlockChainErrMsg, getCawPriceInUsd, getEthPriceInUsd, getExplorerUrl } from "src/hooks/contractHelper";

export default function SwapMCAWForm() {

    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { address, connected, chain } = useCawProvider();
    const bg = useColorModeValue("gray.50", "gray.800");
    const brColor = useColorModeValue("caw.500", "gray.50");
    const colorText = useColorModeValue("gray.900", "gray.50");
    const { balance } = useETHBalance(address);
    const { initialized, mint, approve } = useMintableCAWContract();

    const [ { cawUSD, ethUSD }, setPrices ] = useState({ cawUSD: 0, ethUSD: 0 });
    const [ input, setInput ] = useState(0)
    const [ minting, setMinting ] = useState(false)
    const [ approving, setApproving ] = useState(false);

    const [ error, setError ] = useState<string | null>(null);
    const [ txMintHash, setMintTxHash ] = useState<string | null>(null);
    const [ txApproveHash, setApproveTxHash ] = useState<string | null>(null);


    useEffect(() => {
        setInput(MILLION);

        let isMounted = true;

        const cbPrice = async () => {

            const cawUSD = await getCawPriceInUsd();
            const ethUSD = await getEthPriceInUsd();

            if (!isMounted)
                return;

            setPrices({ cawUSD, ethUSD });
        }

        cbPrice();

        return () => { isMounted = false; };
    }, []);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(Number(e.target.value));

    const handleSubmit = async () => {
        try {
            if (!initialized) {
                setError('Contract not initialized');
                return;
            }

            if (input <= 0) {
                setError(t('common.amountgtzero'));
                return;
            }

            setError(null);
            setMinting(true);
            const { tx } = await mint(address, input);

            setMintTxHash(tx.hash);
            setMinting(false);
            handleApprove();
        }
        catch (error: any) {
            setMinting(false);
            const { code, message } = getBlockChainErrMsg(error);
            setError(message ? message + ' : ' + code : 'Something went wrong');
        }
    }

    const handleApprove = async () => {
        try {

            if (!initialized) {
                setError('Contract not initialized');
                return;
            }

            setError(null);
            setApproving(true);
            const { tx } = await approve(address, input);
            setApproveTxHash(tx.hash);
            setApproving(false);
        } catch (error: any) {
            const { code, message } = getBlockChainErrMsg(error);
            setApproving(false);
            setError(message ? message + ' : ' + code : 'Something went wrong');
        }
    }

    const handleReset = () => {
        setMinting(false);
        setApproving(false);
        setError(null);
        setMintTxHash(null);
        setApproveTxHash(null);
    }

    const mintExplorerTxUrl = getExplorerUrl({ addressOrTx: txMintHash || '', network: chain?.id || 0, type: 'tx' });
    const approveExplorerTxUrl = getExplorerUrl({ addressOrTx: txApproveHash || '', network: chain?.id || 0, type: 'tx' });

    return (
        <Block>
            <Container
                p={5}
                bg={bg}
                borderColor={brColor}
                w="full"
                h={"container.sm"}
                borderRadius={"lg"}
                border={"1px solid"}
            >
                <Text color={colorText} fontSize="xl" as="b">
                    {sentenceCase(t('verbs.swap'))}
                </Text>
                <Divider />
                <Spacer h={10} />
                <VStack spacing={2}>
                    <FormControl isInvalid={Boolean(error)} colorScheme="blue">
                        <HStack spacing={4}>
                            <Image src={`/assets/tokens/eth.png`} alt='ETH' width={24} height={24} />
                            <Text as="b">ETH</Text>
                            <Spacer />
                            <Text as="b">{t('labels.balance')} : {kFormatter(balance)}</Text>
                        </HStack>
                        <Spacer h={10} />
                        <VStack spacing={4}>
                            <InputGroup size='lg'>
                                <InputLeftAddon children={sentenceCase(t('verbs.get'))} />
                                <Input
                                    type="number"
                                    placeholder={t('labels.enter_amount')}
                                    size='lg'
                                    value={input}
                                    onChange={handleInputChange}
                                    readOnly={Boolean(txApproveHash || txMintHash)}
                                    style={{ textAlign: 'right' }}
                                />
                                <InputRightAddon children={<span><b>{kFormatter(input)}</b> mCAW</span>} />
                            </InputGroup>
                        </VStack>
                        <Spacer h={10} />
                        <VStack alignItems="flex-end" >
                            <Text>
                                {`1 CAW : $${(cawUSD.toFixed(12))}`}
                            </Text>
                            <Text>
                                {`1 ETH : $${fDecimal(ethUSD)}`}
                            </Text>
                        </VStack>

                        <FormErrorMessage>
                            {error && (<AlertMessage type="warning" message={error} />)}
                        </FormErrorMessage>
                        <Center>
                            {connected ?
                                <VStack width={"full"}>
                                    <Button
                                        mt={5}
                                        width={"full"}
                                        colorScheme="caw"
                                        isLoading={minting}
                                        loadingText={t('labels.minting')}
                                        disabled={Boolean(txMintHash || txApproveHash)}
                                        onClick={onOpen}
                                    >
                                        {t('buttons.btn_mint')}
                                    </Button>
                                    {Boolean(txMintHash) && (
                                        <Text color="green.500" as="b">
                                            {`${t('labels.minted')} ${kFormatter(input)} mCAW`}
                                        </Text>
                                    )}
                                    {txMintHash && (
                                        <Link href={mintExplorerTxUrl} isExternal>
                                            <Text color="blue.500" as="a">
                                                {`TX ${shortenAddress(txMintHash)} Etherscan`}
                                            </Text>
                                        </Link>
                                    )}

                                    {!Boolean(txApproveHash) && (
                                        <Text lineHeight={2} as="p">
                                            {t('swap_page.approve_req_msg')}
                                        </Text>
                                    )}
                                    <Button
                                        mt={5}
                                        width={"full"}
                                        colorScheme="green"
                                        disabled={Boolean(txMintHash) ? (Boolean(txApproveHash)) : true}
                                        isLoading={approving}
                                        loadingText={t('labels.approving')}
                                        onClick={handleApprove}
                                    >
                                        {t('buttons.btn_approve')}
                                    </Button>
                                    {Boolean(txApproveHash) && (
                                        <Text color="green.500" as="b">
                                            {`${t('labels.approved')} ${kFormatter(input)} mCAW`}
                                        </Text>
                                    )}
                                    {txApproveHash && (
                                        <Link href={approveExplorerTxUrl} isExternal>
                                            <Text color="blue.500" as="a">
                                                {`TX ${shortenAddress(txApproveHash)} Etherscan`}
                                            </Text>
                                        </Link>
                                    )}
                                    {Boolean(txMintHash) && Boolean(txApproveHash) && (
                                        <Button
                                            mt={5}
                                            width={"full"}
                                            colorScheme="blue"
                                            onClick={handleReset}
                                        >
                                            {t('buttons.btn_start_over')}
                                        </Button>
                                    )}
                                    <AlertDialog
                                        isOpen={isOpen}
                                        title={sentenceCase(t('verbs.confirm'))}
                                        cancelText={sentenceCase(t('verbs.cancel'))}
                                        confirmText={sentenceCase(t('verbs.mint'))}
                                        confirmColorScheme="blue"
                                        body={t('swap_page.alert_cf_mint').replaceAll('{$0}', kFormatter(input))}
                                        onClose={onClose}
                                        onConfirm={handleSubmit}
                                    />
                                </VStack>
                                :
                                <ConnectWalletButton />
                            }
                        </Center>
                    </FormControl>
                </VStack>
            </Container>
        </Block>
    );
}